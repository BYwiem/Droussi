import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import ExamPreview from "../components/ExamPreview";
import type { ExamRow } from "../types";

export default function ExamView() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<ExamRow | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setExam(data as ExamRow);
    })();
  }, [id]);

  async function download() {
    if (!exam) return;
    const { url } = await apiFetch<{ url: string }>(
      `/api/exams/${exam.id}/download`
    );
    window.open(url, "_blank");
  }

  if (!exam) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        {exam.status === "ready" && exam.export_path && (
          <button
            onClick={() => void download()}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" /> Download {exam.export_format?.toUpperCase()}
          </button>
        )}
      </div>
      {exam.content ? (
        <ExamPreview exam={exam.content} />
      ) : (
        <p className="text-sm text-slate-500">
          Exam status: {exam.status}. No content yet.
        </p>
      )}
    </div>
  );
}
