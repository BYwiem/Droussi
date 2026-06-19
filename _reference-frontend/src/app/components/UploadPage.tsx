import { CheckCircle, File, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "done" | "error";
  progress: number;
  subject: string;
  tags: string[];
}

interface UploadPageProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  existingFiles: UploadedFile[];
}

const SUBJECTS = ["Mathematics", "Biology", "Chemistry", "Physics", "History", "Geography", "Literature", "Computer Science", "Arabic", "French", "English"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = { pdf: "#f26110", docx: "#0069e0", doc: "#0069e0", pptx: "#e05a00", txt: "#535862" };
  const color = colors[ext] || "#535862";
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <FileText size={18} color={color} />
    </div>
  );
}

export function UploadPage({ onFilesUploaded, existingFiles }: UploadPageProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Biology");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Chapter 5", "Lecture"]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.name.split(".").pop()?.toLowerCase() || "file",
      status: "uploading" as const,
      progress: 0,
      subject: selectedSubject,
      tags: [...tags],
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((file) => {
      let prog = 0;
      const interval = setInterval(() => {
        prog += Math.random() * 25 + 10;
        if (prog >= 100) {
          prog = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, status: "done", progress: 100 } : f))
          );
          setFiles((prev) => {
            onFilesUploaded(prev.filter((f) => f.status === "done"));
            return prev;
          });
        } else {
          setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, progress: Math.min(prog, 99) } : f)));
        }
      }, 300);
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      onFilesUploaded(updated.filter((f) => f.status === "done"));
      return updated;
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <div style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em" }}>
            Upload Materials
          </h1>
          <p style={{ fontSize: 14, color: "#93979f", marginTop: 6, letterSpacing: "-0.01em" }}>
            Upload lessons, lectures, or notes to generate exams from them
          </p>
        </div>

        {/* Metadata */}
        <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 16 }}>Material details</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#535862", letterSpacing: "-0.01em", display: "block", marginBottom: 8 }}>Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(83,88,98,0.2)",
                  backgroundColor: "#f6f7f8",
                  fontSize: 14,
                  color: "#0a0d12",
                  fontFamily: "'Geist','Inter',sans-serif",
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#535862", letterSpacing: "-0.01em", display: "block", marginBottom: 8 }}>Tags</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(83,88,98,0.2)", backgroundColor: "#f6f7f8", minHeight: 42 }}>
                {tags.map((t) => (
                  <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "#cce7ff", borderRadius: 9999, padding: "2px 10px", fontSize: 12, fontWeight: 500, color: "#0069e0" }}>
                    {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                      <X size={10} color="#0069e0" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag…"
                  style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: "#0a0d12", minWidth: 70, flex: 1, fontFamily: "'Geist','Inter',sans-serif" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: dragOver ? "#cce7ff" : "#fafdff",
            borderRadius: 24,
            border: `2px dashed ${dragOver ? "#0069e0" : "rgba(83,88,98,0.25)"}`,
            padding: "48px 32px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.18s ease",
            marginBottom: 20,
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: "#cce7ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Upload size={24} color="#0069e0" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Drop files here or click to browse
          </p>
          <p style={{ fontSize: 13, color: "#93979f" }}>Supports PDF, DOCX, PPTX, TXT — up to 50 MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.pptx,.txt"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(83,88,98,0.08)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#535862" }}>{files.length} file{files.length !== 1 ? "s" : ""}</span>
            </div>
            {files.map((file, i) => (
              <div
                key={file.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < files.length - 1 ? "1px solid rgba(83,88,98,0.07)" : "none",
                }}
              >
                <FileIcon ext={file.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#0a0d12", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "#93979f" }}>{formatBytes(file.size)}</span>
                    <span style={{ fontSize: 12, color: "#93979f" }}>·</span>
                    <span style={{ fontSize: 12, color: "#93979f" }}>{file.subject}</span>
                    {file.status === "uploading" && (
                      <>
                        <span style={{ fontSize: 12, color: "#93979f" }}>·</span>
                        <div style={{ flex: 1, height: 4, backgroundColor: "#f6f7f8", borderRadius: 9999, overflow: "hidden", maxWidth: 120 }}>
                          <div style={{ height: "100%", width: `${file.progress}%`, backgroundColor: "#0069e0", borderRadius: 9999, transition: "width 0.2s ease" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#0069e0", fontWeight: 500 }}>{Math.round(file.progress)}%</span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  {file.status === "uploading" && <Loader2 size={16} color="#0069e0" className="animate-spin" />}
                  {file.status === "done" && <CheckCircle size={16} color="#1aa06d" />}
                  <button
                    onClick={() => removeFile(file.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, transition: "background-color 0.12s" }}
                    className="hover:bg-[#f6f7f8]"
                  >
                    <Trash2 size={14} color="#93979f" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {files.some((f) => f.status === "done") && (
          <div className="mt-6 flex justify-end">
            <button
              style={{
                backgroundColor: "#181d27",
                color: "#fff",
                borderRadius: 9999,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#181d27")}
            >
              <File size={16} />
              Generate exam from uploaded files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
