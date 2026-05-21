import { Navigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { session, loading, signInWithGoogle } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-semibold text-slate-900">Exam Generator</h1>
        </div>
        <p className="mb-6 text-sm text-slate-600">
          Generate exams from your course documents. Sign in to upload PDFs and create
          tailored MCQ and open-ended question papers.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8a12 12 0 1 1 0-24 12 12 0 0 1 8.5 3.5l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12a12 12 0 0 1 8.5 3.5l5.7-5.7A20 20 0 0 0 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44a20 20 0 0 0 13.5-5.2l-6.2-5.3A12 12 0 0 1 24 36a12 12 0 0 1-11.3-8l-6.5 5A20 20 0 0 0 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.5l6.2 5.3C41 35.1 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
