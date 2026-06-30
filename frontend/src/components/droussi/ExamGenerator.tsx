import { CheckCircle, ChevronDown, ChevronUp, Clock, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface ExamFile {
  id: string;
  name: string;
  subject: string;
  status: string;
}

interface GeneratedExam {
  id: string;
  title: string;
  questions: Question[];
  duration: number;
  totalMarks: number;
  createdAt: string;
}

interface Question {
  id: string;
  type: "mcq" | "short" | "essay" | "truefalse";
  text: string;
  marks: number;
  options?: string[];
  answer?: string;
}

interface ExamGeneratorProps {
  availableFiles: ExamFile[];
  initialSelectedIds?: string[];
  disabled?: boolean;
  onExamGenerated: (exam: GeneratedExam) => void;
  onGenerate?: (params: {
    documentIds: string[];
    examTitle: string;
    duration: number;
    numMCQ: number;
    numShort: number;
    numEssay: number;
    difficulty: "easy" | "medium" | "hard";
  }) => Promise<GeneratedExam>;
  onDownload?: (examId: string, format: string) => void | Promise<void>;
  onViewExam?: (examId: string) => void;
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1", type: "mcq", text: "What is the primary site of photosynthesis in plant cells?",
    marks: 2, options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], answer: "Chloroplast",
  },
  {
    id: "q2", type: "truefalse", text: "Photosynthesis produces oxygen as a byproduct.",
    marks: 1, options: ["True", "False"], answer: "True",
  },
  {
    id: "q3", type: "short", text: "Explain the role of chlorophyll in the process of photosynthesis.",
    marks: 4,
  },
  {
    id: "q4", type: "mcq", text: "Which gas is absorbed by plants during photosynthesis?",
    marks: 2, options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: "Carbon dioxide",
  },
  {
    id: "q5", type: "essay", text: "Describe in detail the two main stages of photosynthesis: the light-dependent reactions and the Calvin cycle. Include the inputs and outputs of each stage.",
    marks: 10,
  },
  {
    id: "q6", type: "short", text: "What is the chemical equation for photosynthesis?",
    marks: 3,
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  mcq: { label: "MCQ", color: "#0069e0", bg: "#cce7ff" },
  short: { label: "Short Answer", color: "#1aa06d", bg: "#d3f6e3" },
  essay: { label: "Essay", color: "#9552e0", bg: "#f1e6ff" },
  truefalse: { label: "True/False", color: "#e05a00", bg: "#ffd1b8" },
};

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const meta = TYPE_LABELS[q.type];

  return (
    <div style={{ backgroundColor: "#fafdff", borderRadius: 20, border: "1px solid rgba(83,88,98,0.12)", overflow: "hidden", marginBottom: 10 }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: "#f6f7f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#535862", flexShrink: 0 }}>
          {index + 1}
        </span>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#0a0d12", letterSpacing: "-0.01em" }}>{q.text}</p>
        <span style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: meta.bg, fontSize: 11, fontWeight: 600, color: meta.color, flexShrink: 0 }}>{meta.label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#535862", flexShrink: 0 }}>{q.marks} pt{q.marks !== 1 ? "s" : ""}</span>
        {expanded ? <ChevronUp size={14} color="#93979f" /> : <ChevronDown size={14} color="#93979f" />}
      </div>
      {expanded && q.options && (
        <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {q.options.map((opt, oi) => (
            <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: q.type === "truefalse" ? 4 : "50%", border: `1.5px solid ${opt === q.answer ? "#0069e0" : "rgba(83,88,98,0.25)"}`, backgroundColor: opt === q.answer ? "#cce7ff" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {opt === q.answer && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#0069e0" }} />}
              </div>
              <span style={{ fontSize: 13, color: opt === q.answer ? "#0069e0" : "#535862", fontWeight: opt === q.answer ? 600 : 400 }}>{opt}</span>
              {opt === q.answer && <CheckCircle size={12} color="#0069e0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExamGenerator({
  availableFiles,
  initialSelectedIds,
  disabled,
  onExamGenerated,
  onGenerate,
  onDownload,
  onViewExam,
}: ExamGeneratorProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    initialSelectedIds?.length
      ? initialSelectedIds
      : availableFiles[0]
        ? [availableFiles[0].id]
        : []
  );
  const [examTitle, setExamTitle] = useState("Chapter Exam");
  const [duration, setDuration] = useState(60);
  const [numMCQ, setNumMCQ] = useState(4);
  const [numShort, setNumShort] = useState(2);
  const [numEssay, setNumEssay] = useState(1);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [generating, setGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (onGenerate) {
      setGenerating(true);
      setError(null);
      void onGenerate({
        documentIds: selectedFiles,
        examTitle,
        duration,
        numMCQ,
        numShort,
        numEssay,
        difficulty,
      })
        .then((exam) => {
          setGeneratedExam(exam);
          onExamGenerated(exam);
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : String(e));
        })
        .finally(() => setGenerating(false));
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const exam: GeneratedExam = {
        id: Math.random().toString(36).slice(2),
        title: examTitle,
        questions: MOCK_QUESTIONS.slice(0, numMCQ + numShort + numEssay),
        duration,
        totalMarks: MOCK_QUESTIONS.slice(0, numMCQ + numShort + numEssay).reduce((sum, q) => sum + q.marks, 0),
        createdAt: new Date().toISOString(),
      };
      setGeneratedExam(exam);
      setGenerating(false);
      onExamGenerated(exam);
    }, 2800);
  };

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 900, margin: "0 auto" }} className="mffb-stagger">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em" }}>
            Exam Generator
          </h1>
          <p style={{ fontSize: 14, color: "#93979f", marginTop: 6, letterSpacing: "-0.01em" }}>
            Configure your exam and let AI create questions from your materials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Config panel */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* File selection */}
            <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 14 }}>Source Materials</h3>
              {availableFiles.length === 0 ? (
                <p style={{ fontSize: 13, color: "#93979f" }}>No files uploaded yet. Go to Upload to add materials.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => toggleFile(file.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: `1.5px solid ${selectedFiles.includes(file.id) ? "#0069e0" : "rgba(83,88,98,0.15)"}`,
                        backgroundColor: selectedFiles.includes(file.id) ? "#cce7ff" : "#f6f7f8",
                        cursor: "pointer",
                        transition: "border-color 0.12s ease, background-color 0.12s ease, scale 0.15s ease-out",
                        textAlign: "left",
                      }}
                    >
                      <FileText size={14} color={selectedFiles.includes(file.id) ? "#0069e0" : "#93979f"} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#0a0d12", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                      {selectedFiles.includes(file.id) && <CheckCircle size={14} color="#0069e0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 16 }}>Exam Settings</h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#535862", display: "block", marginBottom: 6 }}>Exam Title</label>
                  <input
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(83,88,98,0.2)", backgroundColor: "#f6f7f8", fontSize: 13, color: "#0a0d12", fontFamily: "'Geist','Inter',sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#535862", display: "block", marginBottom: 6 }}>Duration (minutes)</label>
                  <input type="number" value={duration} min={15} max={180} step={5} onChange={(e) => setDuration(+e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid rgba(83,88,98,0.2)", backgroundColor: "#f6f7f8", fontSize: 13, color: "#0a0d12", fontFamily: "'Geist','Inter',sans-serif", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#535862", display: "block", marginBottom: 8 }}>Difficulty</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["easy", "medium", "hard"] as const).map((d) => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        style={{
                          flex: 1, padding: "7px 0", borderRadius: 9999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                          backgroundColor: difficulty === d ? "#181d27" : "#f6f7f8",
                          color: difficulty === d ? "#fff" : "#535862",
                          transition: "background-color 0.12s ease, color 0.12s ease, scale 0.15s ease-out",
                          textTransform: "capitalize",
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "MCQ", value: numMCQ, set: setNumMCQ },
                    { label: "Short", value: numShort, set: setNumShort },
                    { label: "Essay", value: numEssay, set: setNumEssay },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "#535862", display: "block", marginBottom: 5 }}>{label}</label>
                      <input type="number" value={value} min={0} max={20} onChange={(e) => set(+e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 10, border: "1px solid rgba(83,88,98,0.2)", backgroundColor: "#f6f7f8", fontSize: 13, color: "#0a0d12", fontFamily: "'Geist','Inter',sans-serif", outline: "none", boxSizing: "border-box", textAlign: "center" }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || selectedFiles.length === 0 || disabled}
              style={{
                backgroundColor: generating || selectedFiles.length === 0 || disabled ? "#93979f" : "#181d27",
                color: "#fff",
                borderRadius: 9999,
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                border: "none",
                cursor: generating || selectedFiles.length === 0 || disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!generating && selectedFiles.length > 0) e.currentTarget.style.backgroundColor = "#2d3444"; }}
              onMouseLeave={(e) => { if (!generating && selectedFiles.length > 0) e.currentTarget.style.backgroundColor = "#181d27"; }}
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? "Generating exam…" : disabled ? "Daily limit reached" : "Generate Exam"}
            </button>
            {error && (
              <p style={{ fontSize: 13, color: "#e05a00", marginTop: 8, lineHeight: 1.4 }}>{error}</p>
            )}
          </div>

          {/* Preview panel */}
          <div className="md:col-span-3">
            {generating && (
              <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", padding: 48, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #b47dff 11%, #7b2fe8 78%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Sparkles size={28} color="#fff" className="animate-pulse" />
                </div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.03em", marginBottom: 8 }}>Generating your exam…</p>
                <p style={{ fontSize: 13, color: "#93979f" }}>AI is analyzing your materials and crafting questions</p>
                <div style={{ marginTop: 24, height: 4, backgroundColor: "#f6f7f8", borderRadius: 9999, overflow: "hidden", maxWidth: 240, margin: "24px auto 0" }}>
                  <div style={{ height: "100%", backgroundColor: "#9552e0", borderRadius: 9999, animation: "pulse 1.5s ease-in-out infinite", width: "60%" }} />
                </div>
              </div>
            )}

            {!generating && !generatedExam && (
              <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", padding: 48, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: "#f6f7f8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <FileText size={28} color="#93979f" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 6 }}>No exam generated yet</p>
                <p style={{ fontSize: 13, color: "#93979f" }}>Configure your settings and click Generate Exam</p>
              </div>
            )}

            {!generating && generatedExam && (
              <div className="mffb-enter" style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", overflow: "hidden" }}>
                {/* Exam header */}
                <div style={{ background: "linear-gradient(135deg, #b47dff 11%, #7b2fe8 78%)", padding: "24px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Generated Exam</p>
                      <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.2 }}>{generatedExam.title}</h2>
                      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                          <Clock size={13} />{generatedExam.duration} min
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                          <FileText size={13} />{generatedExam.questions.length} questions
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.8)", fontVariantNumeric: "tabular-nums" }}>
                          <Sparkles size={13} />{generatedExam.totalMarks} marks
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {onViewExam && (
                        <button
                          onClick={() => onViewExam(generatedExam.id)}
                          style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.25)", color: "#fff", borderRadius: 9999, padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                        >
                          Open full view
                        </button>
                      )}
                      <button
                        onClick={() => void onDownload?.(generatedExam.id, "pdf")}
                        style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 9999, padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        <Download size={13} /> PDF
                      </button>
                      <button
                        onClick={() => void onDownload?.(generatedExam.id, "docx")}
                        style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 9999, padding: "7px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        <Download size={13} /> DOCX
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions */}
                <div style={{ padding: "20px" }}>
                  {generatedExam.questions.map((q, i) => (
                    <QuestionCard key={q.id} q={q} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
