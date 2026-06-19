import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserData } from "../../hooks/useUserData";
import { UploadPage } from "../../components/droussi/UploadPage";
import { uploadDocument } from "../../lib/droussiData";
import {
  getDocumentMetaOrDefault,
  removeDocumentMeta,
  setDocumentMeta,
} from "../../lib/documentMeta";
import { apiFetch } from "../../lib/api";

export default function UploadRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { docs, loading, reload } = useUserData();

  const existingFiles = useMemo(
    () =>
      docs.map((d) => {
        const meta = getDocumentMetaOrDefault(d.id);
        return {
          id: d.id,
          name: d.filename,
          size: d.size_bytes ?? 0,
          type: d.filename.split(".").pop()?.toLowerCase() || "pdf",
          status: "done" as const,
          progress: 100,
          subject: meta.subject,
          tags: meta.tags,
        };
      }),
    [docs]
  );

  if (!user) return null;

  return (
    <UploadPage
      existingFiles={existingFiles}
      loading={loading}
      onFilesUploaded={() => void reload()}
      onGoToExam={() => navigate("/exam")}
      onDeleteFile={async (id) => {
        await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
        removeDocumentMeta(id);
        await reload();
      }}
      onUploadFile={async (file, meta) => {
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error("Only PDF files are supported.");
        }
        const doc = await uploadDocument(user.id, file);
        setDocumentMeta(doc.id, { subject: meta.subject, tags: meta.tags });
        await reload();
        return {
          id: doc.id,
          name: doc.filename,
          size: doc.size_bytes ?? file.size,
          type: doc.filename.split(".").pop()?.toLowerCase() || "pdf",
          status: "done" as const,
          progress: 100,
          subject: meta.subject,
          tags: meta.tags,
        };
      }}
    />
  );
}
