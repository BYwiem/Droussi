import { ArrowRight, FileText, FolderOpen, Sparkles, Upload } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";
import { UserInitialsAvatar } from "./UserInitialsAvatar";

interface DashboardProps {
  user: { name: string; email: string };
  stats: { uploads: number; exams: number; downloads: number };
  recentActivity?: { id: string | number; type: string; title: string; time: string; color: string }[];
  onNavigate: (page: string) => void;
}

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
      <div style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </p>
        <p style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 13, color: "#93979f", fontWeight: 500, marginTop: 4 }}>{label}</p>
      </div>
    </div>
  );
}

export function Dashboard({ user, stats, recentActivity, onNavigate }: DashboardProps) {
  const { lang } = useLanguage();
  const t = createT(lang);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dash_good_morning") : hour < 17 ? t("dash_good_afternoon") : t("dash_good_evening");

  const quickActions = [
    {
      id: "upload",
      title: t("dash_upload_title"),
      description: t("dash_upload_desc"),
      icon: <Upload size={22} color="#0069e0" />,
      tint: "#cce7ff",
    },
    {
      id: "exam",
      title: t("dash_exam_title"),
      description: t("dash_exam_desc"),
      icon: <Sparkles size={22} color="#9552e0" />,
      tint: "#f1e6ff",
    },
    {
      id: "repository",
      title: t("dash_repo_title"),
      description: t("dash_repo_desc"),
      icon: <FolderOpen size={22} color="#e05a00" />,
      tint: "#ffe6d1",
    },
    {
      id: "outputs",
      title: t("dash_outputs_title"),
      description: t("dash_outputs_desc"),
      icon: <FileText size={22} color="#1aa06d" />,
      tint: "#d3f6e3",
    },
  ];

  return (
    <div style={{ backgroundColor: "#ebf5ff", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }} className="mffb-page">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <UserInitialsAvatar name={user.name} size={48} />
            <div>
              <p style={{ fontSize: 13, color: "#93979f", fontWeight: 500 }}>{greeting}</p>
              <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 700, color: "#0a0d12", letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                {user.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <StatCard label={t("dash_uploads")} value={stats.uploads} icon={<Upload size={20} color="#0069e0" />} color="#cce7ff" />
          <StatCard label={t("dash_exams")} value={stats.exams} icon={<Sparkles size={20} color="#9552e0" />} color="#f1e6ff" />
          <StatCard label={t("dash_downloads")} value={stats.downloads} icon={<FileText size={20} color="#1aa06d" />} color="#d3f6e3" />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.03em", marginBottom: 16 }}>
            {t("dash_quick_actions")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
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
                  transition: "box-shadow 0.18s ease, transform 0.18s ease, scale 0.15s ease-out",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "rgba(4,69,144,0.04) 0px 8px 16px 2px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "rgba(4,69,144,0.12) 0px 14px 24px 4px"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "rgba(4,69,144,0.04) 0px 8px 16px 2px"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: action.tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {action.icon}
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.02em" }}>{action.title}</p>
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
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 600, color: "#0a0d12", letterSpacing: "-0.03em" }}>
              {t("dash_recent_activity")}
            </h2>
            <button
              onClick={() => onNavigate("repository")}
              style={{ fontSize: 13, fontWeight: 500, color: "#0069e0", letterSpacing: "-0.01em", background: "none", border: "none", cursor: "pointer" }}
            >
              {t("dash_view_all")}
            </button>
          </div>
          <div style={{ backgroundColor: "#fafdff", borderRadius: 24, border: "1px solid rgba(83,88,98,0.12)", overflow: "hidden" }}>
            {!recentActivity || recentActivity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 14, color: "#93979f" }}>{t("dash_no_activity")}</p>
              </div>
            ) : (
              recentActivity.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(83,88,98,0.08)" : "none",
                    transition: "background-color 0.12s ease",
                  }}
                  className="hover:bg-[#f6f7f8]"
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
                  <div style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: item.color, fontSize: 11, fontWeight: 600, color: item.type === "upload" ? "#0069e0" : item.type === "exam" ? "#9552e0" : "#1aa06d", textTransform: "uppercase", letterSpacing: "0.02em", flexShrink: 0 }}>
                    {item.type}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
