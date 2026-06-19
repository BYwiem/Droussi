import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import ExamPreview from "../components/ExamPreview";
import type { ExamRow } from "../types";

const pageStyle = {
  backgroundColor: "#ebf5ff",
  minHeight: "calc(100vh - 64px)",
  fontFamily: "'Geist','Inter',sans-serif",
} as const;

export default function ExamView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [exam, setExam] = useState<ExamRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    void (async () => {
      const { data } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setExam(data as ExamRow);
      else setNotFound(true);
    })();
  }, [id, user]);

  async function download() {
    if (!exam) return;
    const { url } = await apiFetch<{ url: string }>(`/api/exams/${exam.id}/download`);
    window.open(url, "_blank");
  }

  if (notFound) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "#93979f" }}>Exam not found.</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={pageStyle} className="px-4 py-10">
        <p style={{ fontSize: 14, color: "#93979f" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="px-4 py-10">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/outputs"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#535862", textDecoration: "none" }}
          >
            <ArrowLeft size={16} /> Back to outputs
          </Link>
          {exam.status === "ready" && exam.export_path && (
            <button
              onClick={() => void download()}
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
                border: "none",
                cursor: "pointer",
              }}
            >
              <Download size={16} /> Download {exam.export_format?.toUpperCase()}
            </button>
          )}
        </div>
        {exam.content ? (
          <div
            style={{
              backgroundColor: "#fafdff",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              padding: 24,
            }}
          >
            <ExamPreview exam={exam.content} />
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "#93979f" }}>
            Exam status: {exam.status}. No content yet.
          </p>
        )}
      </div>
    </div>
  );
}
