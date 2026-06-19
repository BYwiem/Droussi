import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ExamGenerator } from "./components/ExamGenerator";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { NavBar } from "./components/NavBar";
import { OutputManager } from "./components/OutputManager";
import { Repository } from "./components/Repository";
import { UploadPage } from "./components/UploadPage";

interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: string;
  progress: number;
  subject: string;
  tags: string[];
}

interface GeneratedExam {
  id: string;
  title: string;
  questions: any[];
  duration: number;
  totalMarks: number;
  createdAt: string;
  subject?: string;
}

const MOCK_REPO_FILES_INITIAL = [
  { id: "r1", name: "Chapter 5 – Photosynthesis.pdf", subject: "Biology", type: "pdf", status: "done", progress: 100, size: 2400000, tags: ["Chapter 5", "Lecture"] },
  { id: "r2", name: "Algebra Week 3 – Quadratic Equations.docx", subject: "Mathematics", type: "docx", status: "done", progress: 100, size: 1100000, tags: ["Week 3", "Algebra"] },
  { id: "r3", name: "Newton's Laws of Motion.pdf", subject: "Physics", type: "pdf", status: "done", progress: 100, size: 3100000, tags: ["Newton", "Forces"] },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showLanding, setShowLanding] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(MOCK_REPO_FILES_INITIAL);
  const [generatedExams, setGeneratedExams] = useState<GeneratedExam[]>([]);
  const [stats, setStats] = useState({ uploads: 3, exams: 5, downloads: 8 });

  const handleLogin = (userData: { name: string; email: string; avatar: string; role: string }) => {
    setUser(userData);
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage("dashboard");
    setShowLanding(true);
  };

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setStats((prev) => ({ ...prev, uploads: files.length + 3 }));
  };

  const handleExamGenerated = (exam: GeneratedExam) => {
    setGeneratedExams((prev) => {
      const updated = [exam, ...prev.filter((e) => e.id !== exam.id)];
      setStats((s) => ({ ...s, exams: s.exams + 1 }));
      return updated;
    });
  };

  const handleNavigateToExam = () => setCurrentPage("exam");

  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const examFiles = uploadedFiles
    .filter((f) => f.status === "done")
    .map((f) => ({ id: f.id, name: f.name, subject: f.subject, status: f.status }));

  const repoFiles = uploadedFiles.map((f) => ({
    ...f,
    examCount: 0,
    size: f.size ? (f.size / (1024 * 1024)).toFixed(1) + " MB" : "—",
    uploadedAt: new Date().toISOString().slice(0, 10),
    tags: f.tags || [],
  }));

  const outputExams = generatedExams.map((e) => ({
    ...e,
    subject: e.subject || "Biology",
    questions: e.questions?.length || 7,
    formats: ["pdf", "docx"],
    status: "ready" as const,
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ebf5ff", fontFamily: "'Geist','Inter',sans-serif" }}>
      <NavBar user={user} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />

      <main>
        {currentPage === "dashboard" && (
          <Dashboard user={user} stats={stats} onNavigate={setCurrentPage} />
        )}
        {currentPage === "upload" && (
          <UploadPage onFilesUploaded={handleFilesUploaded} existingFiles={uploadedFiles} />
        )}
        {currentPage === "exam" && (
          <ExamGenerator availableFiles={examFiles} onExamGenerated={handleExamGenerated} />
        )}
        {currentPage === "repository" && (
          <Repository
            uploadedFiles={repoFiles}
            onRegenerateExam={(id) => { console.log("Regenerate from", id); }}
            onNavigateToExam={handleNavigateToExam}
          />
        )}
        {currentPage === "outputs" && (
          <OutputManager generatedExams={outputExams} />
        )}
      </main>
    </div>
  );
}
