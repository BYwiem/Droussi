import { Calendar, FileText, FolderOpen, RefreshCw, Search, Sparkles, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";
import {
  compareBySort,
  groupBySubject,
  matchesDateFilter,
  type DateFilter,
  type SortOption,
} from "../../lib/libraryFilters";
import { sortSubjects, subjectStyle } from "../../lib/subjects";
import {
  DateFilterControls,
  FilterSelect,
  GenreSpaces,
  GenreSpacesMobile,
  sortOptions,
} from "./LibraryFilters";

interface RepoFile {
  id: string;
  name: string;
  subject: string;
  type: string;
  uploadedAt: string;
  tags: string[];
  examCount: number;
  size: string;
}

interface RepositoryProps {
  uploadedFiles: RepoFile[];
  onRegenerateExam: (fileId: string) => void;
  onNavigateToExam: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  pdf: "#f26110",
  docx: "var(--brand)",
  pptx: "#e05a00",
  txt: "var(--text-secondary)",
  doc: "var(--brand)",
};

function FileCard({
  file,
  onRegenerate,
  generateLabel,
  noExamsLabel,
}: {
  file: RepoFile;
  onRegenerate: (id: string) => void;
  generateLabel: string;
  noExamsLabel: string;
}) {
  const style = subjectStyle(file.subject);
  const typeColor = TYPE_COLORS[file.type] || "var(--text-secondary)";

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 24,
        border: "1px solid var(--border)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        boxShadow: "var(--shadow) 0px 4px 12px 0px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-strong) 0px 12px 20px 0px";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow) 0px 4px 12px 0px";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: `color-mix(in srgb, ${typeColor} 14%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FileText size={20} color={typeColor} />
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 9999,
            backgroundColor: style.bg,
            fontSize: 11,
            fontWeight: 600,
            color: style.color,
          }}
        >
          {file.subject}
        </span>
      </div>

      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--foreground)",
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          {file.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted-foreground)" }}>
            <Calendar size={11} />
            {file.uploadedAt}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
            {file.type}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{file.size}</span>
        </div>
      </div>

      {file.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {file.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                padding: "2px 8px",
                borderRadius: 9999,
                backgroundColor: "var(--muted)",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
          {file.tags.length > 3 && (
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>+{file.tags.length - 3}</span>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={11} color={file.examCount > 0 ? "#9552e0" : "var(--muted-foreground)"} />
          {file.examCount > 0
            ? `${file.examCount} exam${file.examCount !== 1 ? "s" : ""}`
            : noExamsLabel}
        </span>
        <button
          onClick={() => onRegenerate(file.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            borderRadius: 9999,
            padding: "7px 14px",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={11} /> {generateLabel}
        </button>
      </div>
    </div>
  );
}

export function Repository({ uploadedFiles, onRegenerateExam, onNavigateToExam }: RepositoryProps) {
  const { lang } = useLanguage();
  const t = createT(lang);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [tag, setTag] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: "all" });
  const [sort, setSort] = useState<SortOption>("newest");

  const allFiles = useMemo(
    () =>
      uploadedFiles.map((f) => ({
        ...f,
        uploadedAt: f.uploadedAt ?? new Date().toISOString().slice(0, 10),
        examCount: f.examCount ?? 0,
        size: f.size ?? "—",
        tags: f.tags || [],
        subject: f.subject || "General",
        type: (f.type || "file").toLowerCase(),
      })),
    [uploadedFiles]
  );

  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of allFiles) counts.set(f.subject, (counts.get(f.subject) ?? 0) + 1);
    return sortSubjects([...counts.keys()]).map((subject) => ({
      subject,
      count: counts.get(subject) ?? 0,
    }));
  }, [allFiles]);

  const fileTypes = useMemo(() => {
    const types = Array.from(new Set(allFiles.map((f) => f.type))).sort();
    return types;
  }, [allFiles]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const f of allFiles) for (const tg of f.tags) tags.add(tg);
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [allFiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allFiles.filter((f) => {
      const matchSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.subject.toLowerCase().includes(q) ||
        f.tags.some((tg) => tg.toLowerCase().includes(q));
      const matchGenre = genre === "all" || f.subject === genre;
      const matchType = fileType === "all" || f.type === fileType;
      const matchTag = tag === "all" || f.tags.includes(tag);
      const matchDate = matchesDateFilter(f.uploadedAt, dateFilter);
      return matchSearch && matchGenre && matchType && matchTag && matchDate;
    });

    return [...list].sort((a, b) => {
      if (sort === "newest" || sort === "oldest" || sort === "name_asc" || sort === "name_desc") {
        // Prefer exam count as secondary for "most used" feel when dates tie — handled in compare
        return compareBySort(
          { name: a.name, date: a.uploadedAt },
          { name: b.name, date: b.uploadedAt },
          sort
        );
      }
      return 0;
    });
  }, [allFiles, search, genre, fileType, tag, dateFilter, sort]);

  const sections = useMemo(() => {
    const order =
      genre === "all"
        ? sortSubjects(Array.from(new Set(filtered.map((f) => f.subject))))
        : [genre];
    return groupBySubject(filtered, order);
  }, [filtered, genre]);

  const handleRegenerate = (id: string) => {
    onRegenerateExam(id);
    onNavigateToExam();
  };

  const dateLabels = {
    date: t("filter_date"),
    all: t("filter_date_all"),
    today: t("filter_date_today"),
    week: t("filter_date_week"),
    month: t("filter_date_month"),
    year: t("filter_date_year"),
    custom: t("filter_date_custom"),
    from: t("filter_date_from"),
    to: t("filter_date_to"),
  };

  return (
    <div
      style={{
        backgroundColor: "var(--background)",
        minHeight: "calc(100vh - 64px)",
        fontFamily: "'Geist','Inter',sans-serif",
      }}
      className="px-4 py-10"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.04em",
            }}
          >
            {t("repo_title")}
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6, letterSpacing: "-0.01em" }}>
            {t("repo_desc")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 24,
            alignItems: "start",
          }}
          className="repo-layout"
        >
          <div className="hidden md:block">
            <GenreSpaces
              genres={genreCounts}
              selected={genre}
              onSelect={setGenre}
              allLabel={t("filter_genre_all")}
              spacesLabel={t("filter_genre_spaces")}
            />
          </div>

          <div>
            <div className="md:hidden">
              <GenreSpacesMobile
                genres={genreCounts}
                selected={genre}
                onSelect={setGenre}
                allLabel={t("filter_genre_all")}
              />
            </div>

            <div
              style={{
                backgroundColor: "var(--card)",
                borderRadius: 20,
                border: "1px solid var(--border)",
                padding: 16,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  size={15}
                  color="var(--muted-foreground)"
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("repo_search")}
                  style={{
                    width: "100%",
                    padding: "11px 14px 11px 40px",
                    borderRadius: 14,
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--background)",
                    fontSize: 14,
                    color: "var(--foreground)",
                    fontFamily: "'Geist','Inter',sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                <FilterSelect
                  label={t("filter_type")}
                  value={fileType}
                  onChange={setFileType}
                  options={[
                    { value: "all", label: t("filter_type_all") },
                    ...fileTypes.map((ft) => ({ value: ft, label: ft.toUpperCase() })),
                  ]}
                />
                <FilterSelect
                  label={t("filter_tag")}
                  value={tag}
                  onChange={setTag}
                  options={[
                    { value: "all", label: t("filter_tag_all") },
                    ...allTags.map((tg) => ({ value: tg, label: tg })),
                  ]}
                />
                <DateFilterControls filter={dateFilter} onChange={setDateFilter} labels={dateLabels} />
                <FilterSelect
                  label={t("filter_sort")}
                  value={sort}
                  onChange={(v) => setSort(v as SortOption)}
                  options={sortOptions({
                    newest: t("filter_sort_newest"),
                    oldest: t("filter_sort_oldest"),
                    nameAsc: t("filter_sort_name_asc"),
                    nameDesc: t("filter_sort_name_desc"),
                  })}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <strong style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                  {filtered.length}
                </strong>{" "}
                {t("repo_files")}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <strong style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                  {allFiles.reduce((s, f) => s + f.examCount, 0)}
                </strong>{" "}
                {t("repo_exams_generated")}
              </span>
              {genre !== "all" && (
                <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>
                  {t("filter_viewing_genre")}: {genre}
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <FolderOpen size={40} color="var(--muted-foreground)" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}>{t("repo_no_files")}</p>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
                  {t("repo_no_files_hint")}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {sections.map(({ subject, items }) => {
                  const style = subjectStyle(subject);
                  return (
                    <section key={subject} id={`genre-${subject.replace(/\s+/g, "-").toLowerCase()}`}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 14,
                          paddingBottom: 10,
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 9999,
                            backgroundColor: style.color,
                          }}
                        />
                        <h2
                          style={{
                            fontFamily: "'Inter',sans-serif",
                            fontSize: 18,
                            fontWeight: 700,
                            color: "var(--foreground)",
                            letterSpacing: "-0.02em",
                            margin: 0,
                          }}
                        >
                          {subject}
                        </h2>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: style.color,
                            backgroundColor: style.bg,
                            borderRadius: 9999,
                            padding: "2px 10px",
                          }}
                        >
                          {items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((file) => (
                          <FileCard
                            key={file.id}
                            file={file}
                            onRegenerate={handleRegenerate}
                            generateLabel={t("repo_generate")}
                            noExamsLabel={t("repo_no_exams")}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .repo-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
