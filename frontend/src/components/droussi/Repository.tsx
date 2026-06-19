import { Calendar, FileText, FolderOpen, RefreshCw, Search, Sparkles, Tag } from "lucide-react";
import { useState } from "react";

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

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  Biology: { bg: "#d3f6e3", color: "#1aa06d" },
  Mathematics: { bg: "#cce7ff", color: "#0069e0" },
  History: { bg: "#ffd1b8", color: "#e05a00" },
  Chemistry: { bg: "#f1e6ff", color: "#9552e0" },
  Physics: { bg: "#fff2be", color: "#bb9915" },
  Literature: { bg: "#f6f7f8", color: "#535862" },
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "#f26110",
  docx: "#0069e0",
  pptx: "#e05a00",
  txt: "#535862",
};

function FileCard({ file, onRegenerate }: { file: RepoFile; onRegenerate: (id: string) => void }) {
  const subjectStyle = SUBJECT_COLORS[file.subject] || { bg: "#f6f7f8", color: "#535862" };

  return (
    <div
      style={{
        backgroundColor: "#fafdff",
        borderRadius: 24,
        border: "1px solid rgba(83,88,98,0.12)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all 0.18s ease",
        boxShadow: "rgba(4,69,144,0.04) 0px 4px 12px 0px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "rgba(4,69,144,0.1) 0px 12px 20px 0px"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "rgba(4,69,144,0.04) 0px 4px 12px 0px"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* File icon + type */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: TYPE_COLORS[file.type] + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={20} color={TYPE_COLORS[file.type] || "#535862"} />
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: subjectStyle.bg, fontSize: 11, fontWeight: 600, color: subjectStyle.color }}>
          {file.subject}
        </span>
      </div>

      {/* Title */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 4 }}>{file.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#93979f" }}>
            <Calendar size={11} />{file.uploadedAt}
          </span>
          <span style={{ fontSize: 12, color: "#93979f" }}>{file.size}</span>
        </div>
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {file.tags.slice(0, 3).map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 9999, backgroundColor: "#f6f7f8", fontSize: 11, fontWeight: 500, color: "#535862" }}>
              <Tag size={9} />{t}
            </span>
          ))}
          {file.tags.length > 3 && <span style={{ fontSize: 11, color: "#93979f" }}>+{file.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontSize: 12, color: "#93979f", display: "flex", alignItems: "center", gap: 4 }}>
          <Sparkles size={11} color={file.examCount > 0 ? "#9552e0" : "#93979f"} />
          {file.examCount > 0 ? `${file.examCount} exam${file.examCount !== 1 ? "s" : ""} generated` : "No exams yet"}
        </span>
        <button
          onClick={() => onRegenerate(file.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#181d27",
            color: "#fff",
            borderRadius: 9999,
            padding: "7px 14px",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            transition: "background-color 0.12s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#181d27")}
        >
          <RefreshCw size={11} /> Generate
        </button>
      </div>
    </div>
  );
}

export function Repository({ uploadedFiles, onRegenerateExam, onNavigateToExam }: RepositoryProps) {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");

  const allFiles = uploadedFiles.map((f) => ({
    ...f,
    uploadedAt: f.uploadedAt ?? new Date().toISOString().slice(0, 10),
    examCount: f.examCount ?? 0,
    size: f.size ?? "—",
    tags: f.tags || [],
  }));

  const subjects = ["All", ...Array.from(new Set(allFiles.map((f) => f.subject)))];

  const filtered = allFiles.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.subject.toLowerCase().includes(search.toLowerCase()) || f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchSubject = filterSubject === "All" || f.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const handleRegenerate = (id: string) => {
    onRegenerateExam(id);
    onNavigateToExam();
  };

  return (
    <div style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em" }}>Repository</h1>
          <p style={{ fontSize: 14, color: "#93979f", marginTop: 6, letterSpacing: "-0.01em" }}>
            Browse your uploaded materials and regenerate exams anytime
          </p>
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={15} color="#93979f" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, subjects, tags…"
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                borderRadius: 14,
                border: "1px solid rgba(83,88,98,0.2)",
                backgroundColor: "#fafdff",
                fontSize: 14,
                color: "#0a0d12",
                fontFamily: "'Geist','Inter',sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 9999,
                  border: filterSubject === s ? "none" : "1px solid rgba(83,88,98,0.15)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  backgroundColor: filterSubject === s ? "#181d27" : "#fafdff",
                  color: filterSubject === s ? "#fff" : "#535862",
                  transition: "all 0.12s ease",
                } as React.CSSProperties}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#93979f" }}><strong style={{ color: "#0a0d12" }}>{filtered.length}</strong> files</span>
          <span style={{ fontSize: 13, color: "#93979f" }}><strong style={{ color: "#0a0d12" }}>{allFiles.reduce((s, f) => s + f.examCount, 0)}</strong> exams generated</span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <FolderOpen size={40} color="#93979f" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: "#0a0d12" }}>No files found</p>
            <p style={{ fontSize: 13, color: "#93979f", marginTop: 4 }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((file) => (
              <FileCard key={file.id} file={file} onRegenerate={handleRegenerate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
