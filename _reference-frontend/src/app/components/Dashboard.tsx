import { ArrowRight, BookOpen, FileText, FolderOpen, GraduationCap, Sparkles, Upload, Users, Zap } from "lucide-react";

interface DashboardProps {
  user: { name: string; email: string; avatar: string; role: string };
  stats: { uploads: number; exams: number; downloads: number };
  onNavigate: (page: string) => void;
}

const RECENT_ACTIVITY = [
  { id: 1, type: "upload", title: "Chapter 5 – Photosynthesis.pdf", time: "2 hours ago", color: "#cce7ff" },
  { id: 2, type: "exam", title: "Biology Mid-term Exam", time: "Yesterday", color: "#f1e6ff" },
  { id: 3, type: "download", title: "Chemistry Quiz – PDF", time: "3 days ago", color: "#d3f6e3" },
  { id: 4, type: "upload", title: "Algebra Lecture Notes Week 3.docx", time: "4 days ago", color: "#cce7ff" },
  { id: 5, type: "exam", title: "History – World War II Exam", time: "1 week ago", color: "#f1e6ff" },
];

const QUICK_ACTIONS = [
  {
    id: "upload",
    title: "Upload Material",
    description: "Upload lesson slides, notes, or lecture recordings",
    icon: <Upload size={22} color="#fff" />,
    gradient: "linear-gradient(135deg, #479dff 11%, #0069e0 78%)",
    iconBg: "#0069e0",
  },
  {
    id: "exam",
    title: "Generate Exam",
    description: "Create AI-powered exams from your uploaded materials",
    icon: <Sparkles size={22} color="#fff" />,
    gradient: "linear-gradient(135deg, #b47dff 11%, #7b2fe8 78%)",
    iconBg: "#7b2fe8",
  },
  {
    id: "repository",
    title: "Repository",
    description: "Browse and reuse your uploaded course materials",
    icon: <FolderOpen size={22} color="#fff" />,
    gradient: "linear-gradient(135deg, #ffa84f 11%, #e05a00 78%)",
    iconBg: "#e05a00",
  },
  {
    id: "outputs",
    title: "My Outputs",
    description: "View, download, or convert your generated exams",
    icon: <FileText size={22} color="#fff" />,
    gradient: "linear-gradient(135deg, #52d69a 11%, #1aa06d 78%)",
    iconBg: "#1aa06d",
  },
];

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        backgroundColor: "#fafdff",
        borderRadius: 24,
        border: "1px solid rgba(83,88,98,0.15)",
        boxShadow: "rgba(4,69,144,0.06) 0px 8px 16px 2px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 28,
            fontWeight: 600,
            color: "#0a0d12",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        <p style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 13, color: "#93979f", fontWeight: 500, marginTop: 4 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

export function Dashboard({ user, stats, onNavigate }: DashboardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }}
      className="px-4 py-10"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <img src={user.avatar} alt={user.name} style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid #cce7ff" }} />
            <div>
              <p style={{ fontSize: 13, color: "#93979f", fontWeight: 500 }}>{greeting}</p>
              <h1
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#0a0d12",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </h1>
            </div>
            <div
              style={{
                marginLeft: "auto",
                backgroundColor: user.role === "teacher" ? "#cce7ff" : "#f1e6ff",
                borderRadius: 9999,
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {user.role === "teacher" ? <GraduationCap size={14} color="#0069e0" /> : <Users size={14} color="#9552e0" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: user.role === "teacher" ? "#0069e0" : "#9552e0", letterSpacing: "-0.01em" }}>
                {user.role === "teacher" ? "Teacher" : "Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label="Materials Uploaded" value={stats.uploads} icon={<Upload size={20} color="#0069e0" />} color="#cce7ff" />
          <StatCard label="Exams Generated" value={stats.exams} icon={<Sparkles size={20} color="#9552e0" />} color="#f1e6ff" />
          <StatCard label="Downloads" value={stats.downloads} icon={<FileText size={20} color="#1aa06d" />} color="#d3f6e3" />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#0a0d12",
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Quick actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                style={{
                  backgroundColor: "#fafdff",
                  borderRadius: 24,
                  border: "1px solid rgba(83,88,98,0.12)",
                  padding: "24px 20px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "rgba(4,69,144,0.04) 0px 8px 16px 2px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "rgba(4,69,144,0.12) 0px 14px 24px 4px";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "rgba(4,69,144,0.04) 0px 8px 16px 2px";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: action.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em" }}>
                    {action.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#93979f", marginTop: 3, lineHeight: 1.4 }}>{action.description}</p>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <ArrowRight size={14} color="#93979f" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#0a0d12",
                letterSpacing: "-0.03em",
              }}
            >
              Recent activity
            </h2>
            <button
              onClick={() => onNavigate("repository")}
              style={{ fontSize: 13, fontWeight: 500, color: "#0069e0", letterSpacing: "-0.01em", background: "none", border: "none", cursor: "pointer" }}
            >
              View all →
            </button>
          </div>
          <div
            style={{
              backgroundColor: "#fafdff",
              borderRadius: 24,
              border: "1px solid rgba(83,88,98,0.12)",
              overflow: "hidden",
            }}
          >
            {RECENT_ACTIVITY.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid rgba(83,88,98,0.08)" : "none",
                  transition: "background-color 0.12s ease",
                }}
                className="hover:bg-[#f6f7f8]"
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.type === "upload" && <Upload size={14} color="#0069e0" />}
                  {item.type === "exam" && <Sparkles size={14} color="#9552e0" />}
                  {item.type === "download" && <FileText size={14} color="#1aa06d" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#0a0d12", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#93979f", marginTop: 1 }}>{item.time}</p>
                </div>
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: 9999,
                    backgroundColor: item.color,
                    fontSize: 11,
                    fontWeight: 600,
                    color: item.type === "upload" ? "#0069e0" : item.type === "exam" ? "#9552e0" : "#1aa06d",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    flexShrink: 0,
                  }}
                >
                  {item.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
