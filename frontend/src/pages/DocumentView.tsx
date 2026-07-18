import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus2, ArrowLeft } from "lucide-react";
import { supabase, DOCUMENTS_BUCKET } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { DocumentRow } from "../types";

const pageStyle = {
  backgroundColor: "var(--background)",
  minHeight: "calc(100vh - 64px)",
  fontFamily: "'Geist','Inter',sans-serif",
} as const;

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    void (async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDoc(data as DocumentRow);
        const storagePath = (data as DocumentRow).storage_path;
        // Only sign keys under the caller's folder (defense in depth vs poisoned paths).
        if (storagePath.startsWith(`${user.id}/`) && !storagePath.includes("..")) {
          const { data: signed } = await supabase.storage
            .from(DOCUMENTS_BUCKET)
            .createSignedUrl(storagePath, 3600);
          setPreviewUrl(signed?.signedUrl ?? null);
        }
      } else {
        setNotFound(true);
      }
    })();
  }, [id, user]);

  if (notFound) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Document not found.</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="px-4 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/repository"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Back to repository
          </Link>
          <Link
            to={`/exam?doc=${doc.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: 9999,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <FilePlus2 size={16} /> Generate exam
          </Link>
        </div>
        <h1
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          {doc.filename}
        </h1>
        <div
          style={{
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          {previewUrl ? (
            <iframe title="document preview" src={previewUrl} className="h-[600px] w-full" />
          ) : (
            <div className="flex h-[600px] items-center justify-center text-sm text-slate-500">
              No preview available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
