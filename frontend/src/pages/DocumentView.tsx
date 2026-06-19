import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus2, ArrowLeft } from "lucide-react";
import { supabase, DOCUMENTS_BUCKET } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import ChatPanel from "../components/ChatPanel";
import type { DocumentRow } from "../types";

const pageStyle = {
  backgroundColor: "#ebf5ff",
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
        const { data: signed } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl((data as DocumentRow).storage_path, 3600);
        setPreviewUrl(signed?.signedUrl ?? null);
      } else {
        setNotFound(true);
      }
    })();
  }, [id, user]);

  if (notFound) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "#93979f" }}>Document not found.</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "#93979f" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="px-4 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/repository"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#535862", textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Back to repository
          </Link>
          <Link
            to={`/exam?doc=${doc.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#181d27",
              color: "#fff",
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
            color: "#0a0d12",
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          {doc.filename}
        </h1>
        <div className="grid gap-6 lg:grid-cols-2">
          <div
            style={{
              overflow: "hidden",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              backgroundColor: "#fafdff",
            }}
          >
            {previewUrl ? (
              <iframe title="document preview" src={previewUrl} className="h-[500px] w-full" />
            ) : (
              <div className="flex h-[500px] items-center justify-center text-sm text-slate-500">
                No preview available.
              </div>
            )}
          </div>
          <ChatPanel scope="document" scopeId={doc.id} />
        </div>
      </div>
    </div>
  );
}
