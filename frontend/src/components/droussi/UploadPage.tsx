import { CheckCircle, File, FileText, Loader2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";
import { SUBJECTS } from "../../lib/subjects";

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
  onUploadFile?: (file: File, meta: { subject: string; tags: string[] }) => Promise<UploadedFile>;
  onDeleteFile?: (id: string) => Promise<void>;
  onGoToExam?: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileIcon({ ext }: { ext: string }) {
  const colors: Record<string, string> = { pdf: "#f26110", docx: "var(--brand)", doc: "var(--brand)", pptx: "#e05a00", txt: "var(--text-secondary)" };
  const color = colors[ext] || "var(--text-secondary)";
  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <FileText size={18} color={color} />
    </div>
  );
}

export function UploadPage({ existingFiles, loading, onFilesUploaded, onUploadFile, onDeleteFile, onGoToExam }: UploadPageProps) {
  const { lang } = useLanguage();
  const t = createT(lang);

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
      const merged = [
        ...existingFiles,
        ...inFlight.filter((f) => !existingFiles.some((e) => e.id === f.id)),
      ];
      return merged.length > 0 || inFlight.length > 0 ? merged : existingFiles;
    });
  }, [existingFiles]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    if (!selectedSubject) {
      setUploadError(t("up_error_subject"));
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
          setFiles((prev) => prev.map((file) => file.id === pending.id ? { ...file, status: "error", progress: 0 } : file));
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
    <div style={{ backgroundColor: "var(--background)", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.04em" }}>{t("up_title")}</h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6, letterSpacing: "-0.01em" }}>{t("up_desc")}</p>
        </div>

        <div style={{ backgroundColor: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: 16 }}>{t("up_material_details")}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "-0.01em", display: "block", marginBottom: 8 }}>{t("up_subject")}</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border-strong)", backgroundColor: "var(--muted)", fontSize: 14, color: selectedSubject ? "var(--foreground)" : "var(--muted-foreground)", fontFamily: "'Geist','Inter',sans-serif", fontWeight: 500, outline: "none", cursor: "pointer" }}
              >
                <option value="">{t("up_subject_placeholder")}</option>
                {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "-0.01em", display: "block", marginBottom: 8 }}>
                {t("up_tags")} <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>{t("up_tags_optional")}</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border-strong)", backgroundColor: "var(--muted)", minHeight: 42 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ display: "flex", alignItems: "center", gap: 4, backgroundColor: "var(--secondary)", borderRadius: 9999, padding: "2px 10px", fontSize: 12, fontWeight: 500, color: "var(--brand)" }}>
                    {tag}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== tag))} style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
                      <X size={10} color="var(--brand)" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  onBlur={() => tagInput.trim() && addTag()}
                  placeholder={tags.length ? t("up_tags_add") : t("up_tags_placeholder")}
                  style={{ border: "none", background: "none", outline: "none", fontSize: 12, color: "var(--foreground)", minWidth: 70, flex: 1, fontFamily: "'Geist','Inter',sans-serif" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: dragOver ? "var(--secondary)" : "var(--card)", borderRadius: 24, border: `2px dashed ${dragOver ? "var(--brand)" : "rgba(83,88,98,0.25)"}`, padding: "48px 32px", textAlign: "center", cursor: selectedSubject ? "pointer" : "not-allowed", opacity: selectedSubject ? 1 : 0.65, transition: "background-color 0.18s ease, border-color 0.18s ease, opacity 0.18s ease", marginBottom: 20 }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Upload size={24} color="var(--brand)" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {selectedSubject ? t("up_drop_ready") : t("up_drop_disabled")}
          </p>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{t("up_drop_hint")}</p>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,application/pdf" onChange={(e) => handleFiles(e.target.files)} style={{ display: "none" }} disabled={!selectedSubject} />
        </div>

        {uploadError && (
          <p style={{ fontSize: 13, color: "#e05a00", marginBottom: 16, padding: "10px 14px", backgroundColor: "var(--chip-pdf-bg)", borderRadius: 12 }}>{uploadError}</p>
        )}

        {loading && files.length === 0 && (
          <div style={{ backgroundColor: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 32, textAlign: "center" }}>
            <Loader2 size={24} color="var(--brand)" className="animate-spin mx-auto mb-3" />
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{t("up_loading")}</p>
          </div>
        )}

        {!loading && files.length === 0 && (
          <div style={{ backgroundColor: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{t("up_no_materials")}</p>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{t("up_no_materials_hint")}</p>
          </div>
        )}

        {files.length > 0 && (
          <div style={{ backgroundColor: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(83,88,98,0.08)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                {doneCount} {lang === "fr" ? "téléversé(s)" : "uploaded"} · {files.length} total
              </span>
            </div>
            {files.map((file, i) => (
              <div
                key={file.id}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < files.length - 1 ? "1px solid rgba(83,88,98,0.07)" : "none" }}
              >
                <FileIcon ext={file.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{formatBytes(file.size)}</span>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>·</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--brand)", backgroundColor: "var(--secondary)", borderRadius: 9999, padding: "1px 8px" }}>{file.subject}</span>
                    {file.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, color: "var(--text-secondary)", backgroundColor: "var(--muted)", borderRadius: 9999, padding: "1px 8px" }}>{tag}</span>
                    ))}
                    {file.status === "uploading" && (
                      <>
                        <Loader2 size={12} color="var(--brand)" className="animate-spin" />
                        <span style={{ fontSize: 12, color: "var(--brand)", fontWeight: 500 }}>{lang === "fr" ? "Téléversement…" : "Uploading…"}</span>
                      </>
                    )}
                    {file.status === "error" && (
                      <span style={{ fontSize: 12, color: "#e05a00", fontWeight: 500 }}>{lang === "fr" ? "Échec du téléversement" : "Upload failed"}</span>
                    )}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  {file.status === "done" && <CheckCircle size={16} color="#1aa06d" />}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    disabled={deletingId === file.id}
                    style={{ background: "none", border: "none", cursor: deletingId === file.id ? "wait" : "pointer", padding: 4, borderRadius: 8, opacity: deletingId === file.id ? 0.5 : 1 }}
                    className="hover:bg-[var(--muted)]"
                  >
                    {deletingId === file.id ? <Loader2 size={14} color="var(--muted-foreground)" className="animate-spin" /> : <Trash2 size={14} color="var(--muted-foreground)" />}
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
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", borderRadius: 9999, padding: "12px 28px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d3444")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
            >
              <File size={16} />
              {t("up_go_exam")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
