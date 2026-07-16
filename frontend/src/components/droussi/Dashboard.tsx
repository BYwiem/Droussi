import { ArrowRight, FileText, FolderOpen, Sparkles, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useUsage } from "../../hooks/useUsage";
import { createT } from "../../lib/i18n";
import { UserInitialsAvatar } from "./UserInitialsAvatar";

interface DashboardProps {
  user: { name: string; email: string };
  stats: { uploads: number; exams: number; downloads: number };
  recentActivity?: { id: string | number; type: string; title: string; time: string; color: string }[];
  onNavigate: (page: string) => void;
}

function barColor(percent: number): string {
  if (percent >= 90) return "#f26110";
  if (percent >= 70) return "#bb9915";
  return "#1aa06d";
}

function formatResetTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Left of the metrics row: the exams usage gauge, full height ──────── */
function GaugeCard() {
  const { usage, loading } = useUsage();

  const percent = usage ? Math.min(100, usage.percent) : 0;
  const color = barColor(percent);

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 24,
        border: "1px solid var(--border)",
        boxShadow: "rgba(4,69,144,0.06) 0px 8px 16px 2px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 20,
        height: "100%",
        minHeight: 200,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em" }}>Exams today</span>
        <div style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: "#f1e6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={17} color="#9552e0" />
        </div>
      </div>

      {loading && !usage ? (
        <div style={{ height: 40, borderRadius: 10, backgroundColor: "var(--muted)" }} />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 44, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {usage ? usage.exams_used : 0}
            </span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "-0.03em" }}>
              / {usage ? usage.exams_limit : "—"}
            </span>
          </div>

          <div>
            <div style={{ height: 8, borderRadius: 9999, backgroundColor: "var(--muted)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${percent}%`, borderRadius: 9999, backgroundColor: color, transition: "width 0.3s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 500, marginTop: 10 }}>
              {usage
                ? `${Math.max(0, usage.remaining)} left · resets at ${formatResetTime(usage.resets_at)}`
                : "Usage unavailable"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── A metric that expands toward the opposite side on hover, revealing a
      short description of what it counts. ──────────────────────────────── */
function HoverStat({
  Icon,
  iconColor,
  tint,
  value,
  label,
  info,
}: {
  Icon: LucideIcon;
  iconColor: string;
  tint: string;
  value: number;
  label: string;
  info: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        backgroundColor: "var(--card)",
        borderRadius: 20,
        border: "1px solid var(--border)",
        boxShadow: hover ? "rgba(4,69,144,0.13) 0px 14px 26px 2px" : "rgba(4,69,144,0.06) 0px 8px 16px 2px",
        padding: "20px 22px",
        height: "100%",
        overflow: "hidden",
        // nudge a little to the opposite side (left) as it expands
        transform: hover ? "translateX(-6px)" : "translateX(0)",
        transition: "box-shadow 0.2s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* accent that slides out on the opposite (left) side */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 16,
          bottom: 16,
          width: 3,
          borderRadius: 9999,
          // backgroundColor: iconColor,
          opacity: hover ? 1 : 0,
          transform: hover ? "translateX(0)" : "translateX(-4px)",
          transition: "opacity 0.2s ease, transform 0.25s ease",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={19} color={iconColor} />
        </div>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {value}
          </p>
          <p style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500, marginTop: 4 }}>{label}</p>
        </div>
      </div>

      {/* revealed description */}
      <div
        style={{
          maxHeight: hover ? 64 : 0,
          opacity: hover ? 1 : 0,
          marginTop: hover ? 12 : 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease, opacity 0.25s ease, margin-top 0.25s ease",
        }}
      >
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, letterSpacing: "-0.01em" }}>{info}</p>
      </div>
    </div>
  );
}

export function Dashboard({ user, stats, recentActivity, onNavigate }: DashboardProps) {
  const { lang } = useLanguage();
  const t = createT(lang);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dash_good_morning") : hour < 17 ? t("dash_good_afternoon") : t("dash_good_evening");

  const quickActions: { id: string; title: string; Icon: LucideIcon; color: string }[] = [
    { id: "upload", title: t("dash_upload_title"), Icon: Upload, color: "var(--brand)" },
    { id: "exam", title: t("dash_exam_title"), Icon: Sparkles, color: "#9552e0" },
    { id: "repository", title: t("dash_repo_title"), Icon: FolderOpen, color: "#e05a00" },
    { id: "outputs", title: t("dash_outputs_title"), Icon: FileText, color: "#1aa06d" },
  ];

  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }} className="px-4 py-10">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <UserInitialsAvatar name={user.name} size={48} />
            <div>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500 }}>{greeting}</p>
              <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                {user.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Metrics: gauge (left, full height) + split stats (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-4 mb-10 items-stretch">
          <GaugeCard />
          <div className="grid gap-4" style={{ gridTemplateRows: "auto 1fr" }}>
            {/* top: uploaded documents */}
            <HoverStat
              Icon={Upload}
              iconColor="var(--brand)"
              tint="var(--secondary)"
              value={stats.uploads}
              label={t("dash_uploads")}
              info="Documents you've uploaded — lecture notes, slides and files Droussi can build exams from."
            />
            {/* bottom: the rest */}
            <div className="grid grid-cols-2 gap-4">
              <HoverStat
                Icon={Sparkles}
                iconColor="#9552e0"
                tint="#f1e6ff"
                value={stats.exams}
                label={t("dash_exams")}
                info="Exams Droussi has generated from your material and saved to your repository."
              />
              <HoverStat
                Icon={FileText}
                iconColor="#1aa06d"
                tint="#d3f6e3"
                value={stats.downloads}
                label={t("dash_downloads")}
                info="Exams you've exported as a PDF or DOCX, ready to print or share."
              />
            </div>
          </div>
        </div>

        {/* Quick Actions — button style, no icon backgrounds */}
        <div className="mb-10">
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.03em", marginBottom: 16 }}>
            {t("dash_quick_actions")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "var(--card)",
                  border: "1px solid rgba(83,88,98,0.18)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
                  boxShadow: "rgba(4,69,144,0.04) 0px 4px 10px 1px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f4faff"; e.currentTarget.style.borderColor = "rgba(0,105,224,0.35)"; e.currentTarget.style.boxShadow = "rgba(4,69,144,0.1) 0px 8px 18px 2px"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--card)"; e.currentTarget.style.borderColor = "rgba(83,88,98,0.18)"; e.currentTarget.style.boxShadow = "rgba(4,69,144,0.04) 0px 4px 10px 1px"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <action.Icon size={20} color={action.color} strokeWidth={2.25} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.02em", flex: 1 }}>{action.title}</span>
                <ArrowRight size={15} color="var(--muted-foreground)" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
              {t("dash_recent_activity")}
            </h2>
            <button
              onClick={() => onNavigate("repository")}
              style={{ fontSize: 13, fontWeight: 500, color: "var(--brand)", letterSpacing: "-0.01em", background: "none", border: "none", cursor: "pointer" }}
            >
              {t("dash_view_all")}
            </button>
          </div>
          <div style={{ backgroundColor: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
            {!recentActivity || recentActivity.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{t("dash_no_activity")}</p>
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
                  className="hover:bg-[var(--muted)]"
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.type === "upload" && <Upload size={14} color="var(--brand)" />}
                    {item.type === "exam" && <Sparkles size={14} color="#9552e0" />}
                    {item.type === "download" && <FileText size={14} color="#1aa06d" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>{item.time}</p>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 9999, backgroundColor: item.color, fontSize: 11, fontWeight: 600, color: item.type === "upload" ? "var(--brand)" : item.type === "exam" ? "#9552e0" : "#1aa06d", textTransform: "uppercase", letterSpacing: "0.02em", flexShrink: 0 }}>
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
