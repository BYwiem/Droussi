import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase, DOCUMENTS_BUCKET } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import type { DocumentRow } from "../types";

interface Props {
  userId: string;
  onUploaded: (doc: DocumentRow) => void;
}

export default function UploadDropzone({ userId, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setBusy(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const doc = await apiFetch<DocumentRow>("/api/documents/register", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      });
      onUploaded(doc);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center hover:border-indigo-400"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        type="file"
        className="hidden"
        accept=".pdf,application/pdf"
        onChange={(e) => void handleFiles(e.target.files)}
        disabled={busy}
      />
      {busy ? (
        <>
          <Loader2 className="mb-2 h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm text-slate-600">Uploading…</span>
        </>
      ) : (
        <>
          <Upload className="mb-2 h-6 w-6 text-indigo-600" />
          <span className="text-sm font-medium text-slate-800">
            Drop a PDF here, or click to upload
          </span>
          <span className="mt-1 text-xs text-slate-500">PDF up to ~20MB</span>
        </>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </label>
  );
}
