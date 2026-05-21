import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, FilePlus2, Download } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { apiFetch } from "../lib/api";
import UploadDropzone from "../components/UploadDropzone";
import type { DocumentRow, ExamRow } from "../types";

export default function Dashboard() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDocs() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDocs(data as DocumentRow[]);
  }
  async function loadExams() {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setExams(data as ExamRow[]);
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([loadDocs(), loadExams()]).finally(() => setLoading(false));
  }, [user]);

  async function downloadExam(id: string) {
    const { url } = await apiFetch<{ url: string }>(`/api/exams/${id}/download`);
    window.open(url, "_blank");
  }

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Your documents</h2>
        </div>
        <UploadDropzone
          userId={user.id}
          onUploaded={(d) => setDocs((cur) => [d, ...cur])}
        />
        <ul className="mt-4 space-y-2">
          {loading && <li className="text-sm text-slate-500">Loading…</li>}
          {!loading && docs.length === 0 && (
            <li className="text-sm text-slate-500">
              No documents yet — upload a PDF to get started.
            </li>
          )}
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <Link
                to={`/documents/${d.id}`}
                className="flex items-center gap-3 text-slate-800 hover:text-indigo-600"
              >
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">{d.filename}</span>
                <span className="text-xs text-slate-400">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </Link>
              <Link
                to={`/documents/${d.id}/build`}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                <FilePlus2 className="h-4 w-4" /> Build exam
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent exams</h2>
        <ul className="space-y-2">
          {exams.length === 0 && (
            <li className="text-sm text-slate-500">No exams generated yet.</li>
          )}
          {exams.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/exams/${e.id}`}
                  className="truncate font-medium text-slate-800 hover:text-indigo-600"
                >
                  {e.title ?? "Untitled exam"}
                </Link>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {e.status}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(e.created_at).toLocaleString()}
                </span>
                {e.status === "ready" && e.export_path && (
                  <button
                    onClick={() => void downloadExam(e.id)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    <Download className="h-3.5 w-3.5" /> {e.export_format?.toUpperCase()}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
