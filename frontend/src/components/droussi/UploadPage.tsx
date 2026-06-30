import { CheckCircle, File, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface UploadedFile {
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
  existingFiles: UploadedFile[];
  loading?: boolean;
  onFilesUploaded: () => void;
  onUploadFile?: (
    file: File,
    meta: { subject: string; tags: string[] }
  ) => Promise<UploadedFile>;
  onDeleteFile?: (id: string) => Promise<void>;
  onGoToExam?: () => void;
}

const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "Literature",
  "Computer Science",
  "Arabic",
  "French",
  "English",
  "General",
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = {
    pdf: "#f26110",
    docx: "#0069e0",
    doc: "#0069e0",
    pptx: "#e05a00",
    txt: "#535862",
  };
  const color = colors[ext] || "#535862";
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: color + "20",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <FileText size={18} color={color} />
    </div>
  );
}

export function UploadPage({
  existingFiles,
  loading,
  onFilesUploaded,
  onUploadFile,
  onDeleteFile,
  onGoToExam,
}: UploadPageProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [dragOver, setDragOver] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles((prev) => {
      const inFlight = prev.filter((f) => f.status === "uploading");
      const inFlightIds = new Set(inFlight.map((f) => f.id));
      const merged = [
        ...existingFiles,
        ...inFlight.filter((f) => !existingFiles.some((e) => e.id === f.id)),
      ];
      return merged.length > 0 || inFlightIds.size > 0 ? merged : existingFiles;
    });
  }, [existingFiles]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    if (!selectedSubject) {
      setUploadError("Select a subject before uploading.");
      return;
    }
    setUploadError(null);

    Array.from(fileList).forEach((f) => {
      void (async () => {
        const pending: UploadedFile = {
          id: crypto.randomUUID(),
          name: f.name,
          size: f.size,
          type: f.name.split(".").pop()?.toLowerCase() || "file",
          status: "uploading",
          progress: 0,
          subject: selectedSubject,
          tags: [...tags],
        };
        setFiles((prev) => [...prev, pending]);

        try {
          let done: UploadedFile;
          if (onUploadFile) {
            done = await onUploadFile(f, { subject: selectedSubject, tags: [...tags] });
          } else {
            done = { ...pending, status: "done", progress: 100 };
          }
          setFiles((prev) => prev.map((file) => (file.id === pending.id ? done : file)));
          onFilesUploaded();
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : String(e));
          setFiles((prev) =>
            prev.map((file) =>
              file.id === pending.id ? { ...file, status: "error", progress: 0 } : file
            )
          );
        }
      })();
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    void (async () => {
      const target = files.find((f) => f.id === id);
      if (!target) return;

      if (target.status === "uploading") {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        return;
      }

      if (onDeleteFile) {
        setDeletingId(id);
        try {
          await onDeleteFile(id);
          setFiles((prev) => prev.filter((f) => f.id !== id));
          onFilesUploaded();
        } catch (e) {
          setUploadError(e instanceof Error ? e.message : String(e));
        } finally {
          setDeletingId(null);
        }
      } else {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }
    })();
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
      setTagInput("");
    }
  };

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div
      style={{
        backgroundColor: "#ebf5ff",
        minHeight: "calc(100vh - 64px)",
        fontFamily: "'Geist','Inter',sans-serif",
      }}
      className="px-4 py-10"
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }} className="mffb-stagger">
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#0a0d12",
              letterSpacing: "-0.04em",
            }}
          >
            Upload Materials
          </h1>
          <p style={{ fontSize: 14, color: "#93979f", marginTop: 6, letterSpacing: "-0.01em" }}>
            Upload PDF lessons or notes, tag them by subject, then generate exams
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fafdff",
            borderRadius: 24,
            border: "1px solid rgba(83,88,98,0.12)",
            padding: 28,
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#0a0d12",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Material details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#535862",
                  letterSpacing: "-0.01em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Subject
              </label>
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
                  color: selectedSubject ? "#0a0d12" : "#93979f",
                  fontFamily: "'Geist','Inter',sans-serif",
                  fontWeight: 500,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Select a subject…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#535862",
                  letterSpacing: "-0.01em",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Tags <span style={{ fontWeight: 400, color: "#93979f" }}>(optional)</span>
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(83,88,98,0.2)",
                  backgroundColor: "#f6f7f8",
                  minHeight: 42,
                }}
              >
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "#cce7ff",
                      borderRadius: 9999,
                      padding: "2px 10px",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#0069e0",
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                      style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}
                    >
                      <X size={10} color="#0069e0" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  onBlur={() => tagInput.trim() && addTag()}
                  placeholder={tags.length ? "Add another…" : "e.g. Chapter 3, Midterm…"}
                  style={{
                    border: "none",
                    background: "none",
                    outline: "none",
                    fontSize: 12,
                    color: "#0a0d12",
                    minWidth: 70,
                    flex: 1,
                    fontFamily: "'Geist','Inter',sans-serif",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: dragOver ? "#cce7ff" : "#fafdff",
            borderRadius: 24,
            border: `2px dashed ${dragOver ? "#0069e0" : "rgba(83,88,98,0.25)"}`,
            padding: "48px 32px",
            textAlign: "center",
            cursor: selectedSubject ? "pointer" : "not-allowed",
            opacity: selectedSubject ? 1 : 0.65,
            transition: "background-color 0.18s ease, border-color 0.18s ease, opacity 0.18s ease",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: "#cce7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Upload size={24} color="#0069e0" />
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#0a0d12",
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            {selectedSubject ? "Drop PDFs here or click to browse" : "Select a subject first"}
          </p>
          <p style={{ fontSize: 13, color: "#93979f" }}>PDF only — up to ~20 MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
            disabled={!selectedSubject}
          />
        </div>

        {uploadError && (
          <p
            style={{
              fontSize: 13,
              color: "#e05a00",
              marginBottom: 16,
              padding: "10px 14px",
              backgroundColor: "#fff2be",
              borderRadius: 12,
            }}
          >
            {uploadError}
          </p>
        )}

        {loading && files.length === 0 && (
          <div
            style={{
              backgroundColor: "#fafdff",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              padding: 32,
              textAlign: "center",
            }}
          >
            <Loader2 size={24} color="#0069e0" className="animate-spin mx-auto mb-3" />
            <p style={{ fontSize: 14, color: "#93979f" }}>Loading your materials…</p>
          </div>
        )}

        {!loading && files.length === 0 && (
          <div
            style={{
              backgroundColor: "#fafdff",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              padding: 32,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: "#0a0d12", marginBottom: 4 }}>
              No materials yet
            </p>
            <p style={{ fontSize: 13, color: "#93979f" }}>
              Choose a subject above, then upload your first PDF
            </p>
          </div>
        )}

        {files.length > 0 && (
          <div
            style={{
              backgroundColor: "#fafdff",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(83,88,98,0.08)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#535862" }}>
                {doneCount} uploaded · {files.length} total
              </span>
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
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0a0d12",
                      letterSpacing: "-0.01em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#93979f" }}>{formatBytes(file.size)}</span>
                    <span style={{ fontSize: 12, color: "#93979f" }}>·</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0069e0",
                        backgroundColor: "#cce7ff",
                        borderRadius: 9999,
                        padding: "1px 8px",
                      }}
                    >
                      {file.subject}
                    </span>
                    {file.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11,
                          color: "#535862",
                          backgroundColor: "#f6f7f8",
                          borderRadius: 9999,
                          padding: "1px 8px",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                    {file.status === "uploading" && (
                      <>
                        <Loader2 size={12} color="#0069e0" className="animate-spin" />
                        <span style={{ fontSize: 12, color: "#0069e0", fontWeight: 500 }}>Uploading…</span>
                      </>
                    )}
                    {file.status === "error" && (
                      <span style={{ fontSize: 12, color: "#e05a00", fontWeight: 500 }}>Upload failed</span>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  {file.status === "done" && <CheckCircle size={16} color="#1aa06d" />}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    disabled={deletingId === file.id}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: deletingId === file.id ? "wait" : "pointer",
                      padding: 4,
                      borderRadius: 8,
                      opacity: deletingId === file.id ? 0.5 : 1,
                    }}
                    className="hover:bg-[#f6f7f8]"
                  >
                    {deletingId === file.id ? (
                      <Loader2 size={14} color="#93979f" className="animate-spin" />
                    ) : (
                      <Trash2 size={14} color="#93979f" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {doneCount > 0 && onGoToExam && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onGoToExam}
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
