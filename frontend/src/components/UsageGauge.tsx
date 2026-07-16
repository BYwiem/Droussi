import { useUsage } from "../hooks/useUsage";

function barColor(percent: number): string {
  if (percent >= 90) return "#f26110";
  if (percent >= 70) return "#bb9915";
  return "#1aa06d";
}

function formatResetTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UsageGauge() {
  const { usage, loading, atLimit } = useUsage();

  if (loading && !usage) {
    return (
      <div
        style={{
          width: 160,
          height: 36,
          borderRadius: 12,
          backgroundColor: "rgba(250,253,255,0.6)",
        }}
      />
    );
  }

  if (!usage) return null;

  const percent = Math.min(100, usage.percent);

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 14,
        border: "1px solid var(--border)",
        padding: "8px 12px",
        minWidth: 160,
        boxShadow: "rgba(4,69,144,0.06) 0px 4px 12px",
      }}
      title={`Exams today: ${usage.exams_used} / ${usage.exams_limit}. Resets at ${formatResetTime(usage.resets_at)} UTC.`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, color: "var(--muted-foreground)" }}>
        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Exams today</span>
        <span style={{ fontWeight: 600, color: atLimit ? "#f26110" : "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
          {usage.exams_used} / {usage.exams_limit}
        </span>
      </div>
      <div
        style={{
          marginTop: 6,
          height: 6,
          borderRadius: 9999,
          backgroundColor: "var(--muted)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: 9999,
            backgroundColor: barColor(percent),
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
