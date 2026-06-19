import { Calendar, CheckCircle, Clock, Download, Eye, FileText, Filter, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";

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
}

const MOCK_OUTPUTS: ExamOutput[] = [
  { id: "o1", title: "Biology Mid-term Exam – Photosynthesis", subject: "Biology", createdAt: "2026-06-09", duration: 60, questions: 7, totalMarks: 22, formats: ["pdf", "docx"], status: "ready" },
  { id: "o2", title: "Mathematics – Quadratic Equations Quiz", subject: "Mathematics", createdAt: "2026-06-08", duration: 45, questions: 10, totalMarks: 20, formats: ["pdf"], status: "ready" },
  { id: "o3", title: "History – World War II Final Exam", subject: "History", createdAt: "2026-06-06", duration: 90, questions: 15, totalMarks: 50, formats: ["pdf", "docx"], status: "ready" },
  { id: "o4", title: "Chemistry – Atomic Structure Test", subject: "Chemistry", createdAt: "2026-06-04", duration: 30, questions: 5, totalMarks: 10, formats: ["docx"], status: "ready" },
  { id: "o5", title: "Physics – Newton's Laws Assessment", subject: "Physics", createdAt: "2026-06-01", duration: 75, questions: 12, totalMarks: 36, formats: ["pdf", "docx"], status: "ready" },
];

const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  Biology: { bg: "#d3f6e3", color: "#1aa06d" },
  Mathematics: { bg: "#cce7ff", color: "#0069e0" },
  History: { bg: "#ffd1b8", color: "#e05a00" },
  Chemistry: { bg: "#f1e6ff", color: "#9552e0" },
  Physics: { bg: "#fff2be", color: "#bb9915" },
  Literature: { bg: "#f6f7f8", color: "#535862" },
};

function PreviewModal({ exam, onClose }: { exam: ExamOutput; onClose: () => void }) {
  const SAMPLE_QUESTIONS = [
    "What is the primary site of photosynthesis in plant cells?",
    "Explain the role of chlorophyll in photosynthesis.",
    "Describe the light-dependent and light-independent reactions.",
    "What is the chemical equation for photosynthesis?",
    "True or False: Photosynthesis produces oxygen as a byproduct.",
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(10,13,18,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "#fafdff", borderRadius: 32, maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "rgba(4,69,144,0.2) 0px 24px 48px 8px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ background: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)", padding: "28px 28px 24px", borderRadius: "32px 32px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Exam Preview</p>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}>{exam.title}</h2>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} />{exam.duration} min</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}><FileText size={12} />{exam.questions} questions</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4 }}><Sparkles size={12} />{exam.totalMarks} marks</span>
              </div>
            </div>
            <button onClick={onClose} style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* Sample questions */}
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#93979f", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Sample Questions</p>
          {SAMPLE_QUESTIONS.slice(0, exam.questions).map((q, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < Math.min(exam.questions, SAMPLE_QUESTIONS.length) - 1 ? "1px solid rgba(83,88,98,0.08)" : "none" }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: "#f6f7f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#535862", flexShrink: 0 }}>{i + 1}</span>
              <p style={{ fontSize: 14, color: "#0a0d12", letterSpacing: "-0.01em", lineHeight: 1.5 }}>{q}</p>
            </div>
          ))}

          {/* Download row */}
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {exam.formats.includes("pdf") && (
              <button style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#f26110", color: "#fff", borderRadius: 9999, padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Download size={14} /> Download PDF
              </button>
            )}
            {exam.formats.includes("docx") && (
              <button style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#0069e0", color: "#fff", borderRadius: 9999, padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Download size={14} /> Download DOCX
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OutputManager({ generatedExams }: OutputManagerProps) {
  const [search, setSearch] = useState("");
  const [previewExam, setPreviewExam] = useState<ExamOutput | null>(null);
  const [filterFormat, setFilterFormat] = useState<"all" | "pdf" | "docx">("all");

  const allOutputs: ExamOutput[] = [
    ...MOCK_OUTPUTS,
    ...generatedExams.map((e) => ({ ...e, formats: ["pdf", "docx"], status: "ready" as const })),
  ];

  const filtered = allOutputs.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.subject.toLowerCase().includes(search.toLowerCase());
    const matchFormat = filterFormat === "all" || o.formats.includes(filterFormat);
    return matchSearch && matchFormat;
  });

  const handleDownload = (exam: ExamOutput, format: string) => {
    alert(`Downloading "${exam.title}" as ${format.toUpperCase()}…\n\n(In production, this triggers a real file download)`);
  };

  return (
    <div style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em" }}>My Outputs</h1>
          <p style={{ fontSize: 14, color: "#93979f", marginTop: 6, letterSpacing: "-0.01em" }}>
            View, preview, and download all your generated exams
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={15} color="#93979f" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams…"
              style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 14, border: "1px solid rgba(83,88,98,0.2)", backgroundColor: "#fafdff", fontSize: 14, color: "#0a0d12", fontFamily: "'Geist','Inter',sans-serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "pdf", "docx"] as const).map((f) => (
              <button key={f} onClick={() => setFilterFormat(f)}
                style={{ padding: "9px 16px", borderRadius: 9999, border: filterFormat === f ? "none" : "1px solid rgba(83,88,98,0.15)", cursor: "pointer", fontSize: 13, fontWeight: 500, backgroundColor: filterFormat === f ? "#181d27" : "#fafdff", color: filterFormat === f ? "#fff" : "#535862", transition: "all 0.12s ease" } as React.CSSProperties}>
                {f === "all" ? "All formats" : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <span style={{ fontSize: 13, color: "#93979f" }}><strong style={{ color: "#0a0d12" }}>{filtered.length}</strong> exams</span>
          <span style={{ fontSize: 13, color: "#93979f" }}><strong style={{ color: "#0a0d12" }}>{filtered.filter((o) => o.formats.includes("pdf")).length}</strong> PDFs available</span>
          <span style={{ fontSize: 13, color: "#93979f" }}><strong style={{ color: "#0a0d12" }}>{filtered.filter((o) => o.formats.includes("docx")).length}</strong> DOCX available</span>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 80px 120px 100px", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(83,88,98,0.1)", backgroundColor: "#f6f7f8" }}>
            {["Exam", "Subject", "Duration", "Marks", "Created", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#93979f", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <FileText size={36} color="#93979f" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "#0a0d12" }}>No exams found</p>
            </div>
          ) : (
            filtered.map((exam, i) => {
              const subjectStyle = SUBJECT_COLORS[exam.subject] || { bg: "#f6f7f8", color: "#535862" };
              return (
                <div
                  key={exam.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 90px 80px 120px 100px",
                    gap: 12,
                    padding: "14px 20px",
                    alignItems: "center",
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(83,88,98,0.07)" : "none",
                    transition: "background-color 0.1s ease",
                  }}
                  className="hover:bg-[#f6f7f8]"
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#0a0d12", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exam.title}</p>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      {exam.formats.map((fmt) => (
                        <span key={fmt} style={{ fontSize: 10, fontWeight: 600, color: fmt === "pdf" ? "#f26110" : "#0069e0", backgroundColor: fmt === "pdf" ? "#fff2be" : "#cce7ff", borderRadius: 9999, padding: "1px 7px", textTransform: "uppercase" }}>{fmt}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: subjectStyle.bg, fontSize: 12, fontWeight: 600, color: subjectStyle.color, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exam.subject}</span>
                  <span style={{ fontSize: 13, color: "#535862", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color="#93979f" />{exam.duration}m</span>
                  <span style={{ fontSize: 13, color: "#535862" }}>{exam.totalMarks} pts</span>
                  <span style={{ fontSize: 12, color: "#93979f", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={11} />{exam.createdAt}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setPreviewExam(exam)} style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: "#f6f7f8", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Preview">
                      <Eye size={14} color="#535862" />
                    </button>
                    {exam.formats.map((fmt) => (
                      <button key={fmt} onClick={() => handleDownload(exam, fmt)}
                        style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: fmt === "pdf" ? "#fff2be" : "#cce7ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        title={`Download ${fmt.toUpperCase()}`}>
                        <Download size={14} color={fmt === "pdf" ? "#f26110" : "#0069e0"} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {previewExam && <PreviewModal exam={previewExam} onClose={() => setPreviewExam(null)} />}
    </div>
  );
}
