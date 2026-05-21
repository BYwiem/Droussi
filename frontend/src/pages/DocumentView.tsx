import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilePlus2, ArrowLeft } from "lucide-react";
import { supabase, DOCUMENTS_BUCKET } from "../lib/supabase";
import ChatPanel from "../components/ChatPanel";
import type { DocumentRow } from "../types";

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setDoc(data as DocumentRow);
        const { data: signed } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl((data as DocumentRow).storage_path, 3600);
        setPreviewUrl(signed?.signedUrl ?? null);
      }
    })();
  }, [id]);

  if (!doc) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Link
          to={`/documents/${doc.id}/build`}
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <FilePlus2 className="h-4 w-4" /> Build exam from this document
        </Link>
      </div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">{doc.filename}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {previewUrl ? (
            <iframe
              title="document preview"
              src={previewUrl}
              className="h-[500px] w-full"
            />
          ) : (
            <div className="flex h-[500px] items-center justify-center text-sm text-slate-500">
              No preview available.
            </div>
          )}
        </div>
        <ChatPanel scope="document" scopeId={doc.id} />
      </div>
    </div>
  );
}
