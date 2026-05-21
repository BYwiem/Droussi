import { Navigate, Route, Routes, Link } from "react-router-dom";
import { LogOut, FileText } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DocumentView from "./pages/DocumentView";
import ExamBuilder from "./pages/ExamBuilder";
import ExamView from "./pages/ExamView";

function Protected({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-800">
            <FileText className="h-5 w-5 text-indigo-600" />
            Exam Generator
          </Link>
          {user && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{user.email}</span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <Protected>
            <Layout>
              <DocumentView />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/documents/:id/build"
        element={
          <Protected>
            <Layout>
              <ExamBuilder />
            </Layout>
          </Protected>
        }
      />
      <Route
        path="/exams/:id"
        element={
          <Protected>
            <Layout>
              <ExamView />
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}
