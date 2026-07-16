import { Calendar, Clock, Download, Eye, FileText, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT, type TKey } from "../../lib/i18n";
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

interface ExamOutput {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  duration: number;
  questions: number;
  totalMarks: number;
  formats: string[];
  status: "ready" | "processing";
}

interface OutputManagerProps {
  generatedExams: ExamOutput[];
  onDownload?: (examId: string, format: string) => void | Promise<void>;
  onPreview?: (examId: string) => void;
}

function PreviewModal({
  exam,
  onClose,
  t,
  onDownload,
}: {
  exam: ExamOutput;
  onClose: () => void;
  t: (k: TKey) => string;
  onDownload?: (examId: string, format: string) => void | Promise<void>;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="mffb-enter"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: 32,
          maxWidth: 540,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-strong) 0px 24px 48px 8px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            backgroundColor: "var(--brand)",
            padding: "28px 28px 24px",
            borderRadius: "32px 32px 0 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                {t("out_preview_label")}
              </p>
              <h2
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                }}
              >
                {exam.title}
              </h2>
              <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} />
                  {exam.duration} min
                </span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
                  <FileText size={12} />
                  {exam.questions} questions
                </span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={12} />
                  {exam.totalMarks} pts
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close preview"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color="#fff" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          {exam.formats.includes("pdf") && (
            <button
              type="button"
              onClick={() => void onDownload?.(exam.id, "pdf")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "var(--accent)",
                color: "#fff",
                borderRadius: 9999,
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Download size={14} /> {t("out_download_pdf")}
            </button>
          )}
          {exam.formats.includes("docx") && (
            <button
              type="button"
              onClick={() => void onDownload?.(exam.id, "docx")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "var(--brand)",
                color: "#fff",
                borderRadius: 9999,
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Download size={14} /> {t("out_download_docx")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OutputManager({ generatedExams, onDownload, onPreview }: OutputManagerProps) {
  const { lang } = useLanguage();
  const t = createT(lang);

  const [search, setSearch] = useState("");
  const [previewExam, setPreviewExam] = useState<ExamOutput | null>(null);
  const [genre, setGenre] = useState("all");
  const [filterFormat, setFilterFormat] = useState<"all" | "pdf" | "docx">("all");
  const [status, setStatus] = useState<"all" | "ready" | "processing">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: "all" });
  const [sort, setSort] = useState<SortOption>("newest");

  const allOutputs: ExamOutput[] = useMemo(
    () =>
      generatedExams.map((e) => ({
        ...e,
        subject: e.subject || "General",
        formats: e.formats?.length ? e.formats : ["pdf", "docx"],
        status: e.status ?? ("ready" as const),
        createdAt: e.createdAt ?? new Date().toISOString().slice(0, 10),
      })),
    [generatedExams]
  );

  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of allOutputs) counts.set(o.subject, (counts.get(o.subject) ?? 0) + 1);
    return sortSubjects([...counts.keys()]).map((subject) => ({
      subject,
      count: counts.get(subject) ?? 0,
    }));
  }, [allOutputs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allOutputs.filter((o) => {
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.subject.toLowerCase().includes(q);
      const matchGenre = genre === "all" || o.subject === genre;
      const matchFormat = filterFormat === "all" || o.formats.includes(filterFormat);
      const matchStatus = status === "all" || o.status === status;
      const matchDate = matchesDateFilter(o.createdAt, dateFilter);
      return matchSearch && matchGenre && matchFormat && matchStatus && matchDate;
    });

    return [...list].sort((a, b) =>
      compareBySort({ title: a.title, date: a.createdAt }, { title: b.title, date: b.createdAt }, sort)
    );
  }, [allOutputs, search, genre, filterFormat, status, dateFilter, sort]);

  const sections = useMemo(() => {
    const order =
      genre === "all"
        ? sortSubjects(Array.from(new Set(filtered.map((o) => o.subject))))
        : [genre];
    return groupBySubject(filtered, order);
  }, [filtered, genre]);

  const handleDownload = (exam: ExamOutput, format: string) => {
    if (onDownload) void onDownload(exam.id, format);
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
            {t("out_title")}
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6, letterSpacing: "-0.01em" }}>
            {t("out_desc")}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: 24,
            alignItems: "start",
          }}
          className="out-layout"
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
                  placeholder={t("out_search")}
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
                  label={t("filter_format")}
                  value={filterFormat}
                  onChange={(v) => setFilterFormat(v as "all" | "pdf" | "docx")}
                  options={[
                    { value: "all", label: t("out_all_formats") },
                    { value: "pdf", label: "PDF" },
                    { value: "docx", label: "DOCX" },
                  ]}
                />
                <FilterSelect
                  label={t("filter_status")}
                  value={status}
                  onChange={(v) => setStatus(v as "all" | "ready" | "processing")}
                  options={[
                    { value: "all", label: t("filter_status_all") },
                    { value: "ready", label: t("filter_status_ready") },
                    { value: "processing", label: t("filter_status_processing") },
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

            <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <strong style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                  {filtered.length}
                </strong>{" "}
                {t("out_exams")}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <strong style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                  {filtered.filter((o) => o.formats.includes("pdf")).length}
                </strong>{" "}
                {t("out_pdfs")}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <strong style={{ color: "var(--foreground)", fontVariantNumeric: "tabular-nums" }}>
                  {filtered.filter((o) => o.formats.includes("docx")).length}
                </strong>{" "}
                {t("out_docx")}
              </span>
              {genre !== "all" && (
                <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 600 }}>
                  {t("filter_viewing_genre")}: {genre}
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: 24,
                  border: "1px solid var(--border)",
                  textAlign: "center",
                  padding: "48px 0",
                }}
              >
                <FileText size={36} color="var(--muted-foreground)" style={{ margin: "0 auto 10px" }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{t("out_no_exams")}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {sections.map(({ subject, items }) => {
                  const style = subjectStyle(subject);
                  return (
                    <section key={subject}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 12,
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

                      <div
                        style={{
                          backgroundColor: "var(--card)",
                          borderRadius: 24,
                          border: "1px solid var(--border)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="out-table-head"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 100px 90px 80px 110px 100px",
                            gap: 12,
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--border)",
                            backgroundColor: "var(--muted)",
                          }}
                        >
                          {[
                            t("out_th_exam"),
                            t("out_th_status"),
                            t("out_th_duration"),
                            t("out_th_marks"),
                            t("out_th_created"),
                            t("out_th_actions"),
                          ].map((h) => (
                            <span
                              key={h}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--muted-foreground)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {h}
                            </span>
                          ))}
                        </div>

                        {items.map((exam, i) => (
                          <div
                            key={exam.id}
                            className="out-table-row hover:bg-[var(--muted)]"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 100px 90px 80px 110px 100px",
                              gap: 12,
                              padding: "14px 20px",
                              alignItems: "center",
                              borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                              transition: "background-color 0.1s ease",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "var(--foreground)",
                                  letterSpacing: "-0.01em",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {exam.title}
                              </p>
                              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                                {exam.formats.map((fmt) => (
                                  <span
                                    key={fmt}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: fmt === "pdf" ? "#f26110" : "var(--brand)",
                                      backgroundColor:
                                        fmt === "pdf" ? "var(--chip-pdf-bg)" : "var(--secondary)",
                                      borderRadius: 9999,
                                      padding: "1px 7px",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {fmt}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: exam.status === "ready" ? "#1aa06d" : "#b86e00",
                                backgroundColor: exam.status === "ready" ? "#d3f6e3" : "#fff0d6",
                                borderRadius: 9999,
                                padding: "3px 8px",
                                display: "inline-block",
                                textAlign: "center",
                              }}
                            >
                              {exam.status === "ready" ? t("filter_status_ready") : t("filter_status_processing")}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Clock size={12} color="var(--muted-foreground)" />
                              {exam.duration}m
                            </span>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                              {exam.totalMarks} pts
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--muted-foreground)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Calendar size={11} />
                              {exam.createdAt}
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() =>
                                  onPreview ? onPreview(exam.id) : setPreviewExam(exam)
                                }
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 9,
                                  backgroundColor: "var(--muted)",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                title="Preview"
                              >
                                <Eye size={14} color="var(--text-secondary)" />
                              </button>
                              {exam.formats.map((fmt) => (
                                <button
                                  key={fmt}
                                  onClick={() => handleDownload(exam, fmt)}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 9,
                                    backgroundColor:
                                      fmt === "pdf" ? "var(--chip-pdf-bg)" : "var(--secondary)",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  title={`Download ${fmt.toUpperCase()}`}
                                >
                                  <Download
                                    size={14}
                                    color={fmt === "pdf" ? "#f26110" : "var(--brand)"}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
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

      {previewExam && (
        <PreviewModal
          exam={previewExam}
          onClose={() => setPreviewExam(null)}
          t={t}
          onDownload={onDownload}
        />
      )}

      <style>{`
        @media (max-width: 767px) {
          .out-layout { grid-template-columns: 1fr !important; }
          .out-table-head { display: none !important; }
          .out-table-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
