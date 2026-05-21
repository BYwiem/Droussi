import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import ExamSpecForm from "../components/ExamSpecForm";
import ChatPanel from "../components/ChatPanel";
import type { DocumentRow, ExamRow, ExamSpec } from "../types";

export default function ExamBuilder() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [doc, setDoc] = useState<DocumentRow | null>(null);
  const [draftExamId, setDraftExamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setDoc(data as DocumentRow);
      const draft = await apiFetch<{ id: string }>(
        `/api/exams/draft?document_id=${id}`,
        { method: "POST" }
      );
      setDraftExamId(draft.id);
    })();
  }, [id]);

  async function handleSubmit(spec: ExamSpec) {
    if (!doc || !draftExamId) return;
    setSubmitting(true);
    setError(null);
    try {
      const exam = await apiFetch<ExamRow>(`/api/exams/${draftExamId}/generate`, {
        method: "POST",
        body: JSON.stringify({ document_id: doc.id, spec }),
      });
      nav(`/exams/${exam.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!doc) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/documents/${doc.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to document
        </Link>
      </div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Build exam</h1>
      <p className="mb-4 text-sm text-slate-600">
        From: <span className="font-medium">{doc.filename}</span>
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <ExamSpecForm onSubmit={handleSubmit} submitting={submitting} />
        {draftExamId && <ChatPanel scope="exam" scopeId={draftExamId} />}
      </div>
      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
