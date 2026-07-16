import { Activity, DollarSign, FileText, Users, Wallet } from "lucide-react";
import type { AdminOverview } from "../../types";

function usd(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 18,
        border: "1px solid var(--border)",
        padding: 20,
        boxShadow: "rgba(4,69,144,0.05) 0px 6px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function AdminDashboard({ data }: { data: AdminOverview }) {
  const accountLine =
    data.account_limit_usd === null
      ? `${usd(data.account_usage_usd)} used · pay-as-you-go`
      : `${usd(data.account_remaining_usd)} left of ${usd(data.account_limit_usd)}`;

  return (
    <div
      style={{ backgroundColor: "var(--background)", minHeight: "calc(100vh - 64px)", fontFamily: "'Geist','Inter',sans-serif" }}
      className="px-4 py-10"
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.04em" }}>
            Admin overview
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 4 }}>
            Credit usage and per-user rankings. Per-user quota:{" "}
            <strong>{data.per_user_exam_limit} exams/day</strong>. Global cap:{" "}
            <strong>{usd(data.global_daily_cost_limit_usd)}/day</strong>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Account credits"
            value={data.account_usage_usd === null ? "—" : usd(data.account_usage_usd)}
            sub={accountLine}
            icon={<Wallet size={18} color="var(--brand)" />}
            color="var(--secondary)"
          />
          <StatCard
            label="Spent (all time)"
            value={usd(data.cost_usd_total)}
            sub={`${usd(data.cost_usd_today)} today`}
            icon={<DollarSign size={18} color="#1aa06d" />}
            color="#d3f6e3"
          />
          <StatCard
            label="Exams generated"
            value={data.exams_total.toLocaleString()}
            sub={`${data.exams_today.toLocaleString()} today`}
            icon={<FileText size={18} color="#9552e0" />}
            color="#f1e6ff"
          />
          <StatCard
            label="Users"
            value={data.user_count.toLocaleString()}
            icon={<Users size={18} color="#bb6515" />}
            color="#fdeecd"
          />
        </div>

        {/* Rankings */}
        <div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: 18,
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "rgba(4,69,144,0.05) 0px 6px 16px",
          }}
        >
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border)" }}>
            <Activity size={16} color="var(--text-secondary)" />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>Usage by user (ranked by spend)</span>
          </div>

          {data.rankings.length === 0 ? (
            <div style={{ padding: 28, textAlign: "center", color: "var(--muted-foreground)", fontSize: 14 }}>No usage recorded yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "var(--muted-foreground)", textAlign: "left" }}>
                    <th style={{ padding: "10px 20px", fontWeight: 600 }}>#</th>
                    <th style={{ padding: "10px 20px", fontWeight: 600 }}>User</th>
                    <th style={{ padding: "10px 20px", fontWeight: 600, textAlign: "right" }}>Exams (today)</th>
                    <th style={{ padding: "10px 20px", fontWeight: 600, textAlign: "right" }}>Exams (total)</th>
                    <th style={{ padding: "10px 20px", fontWeight: 600, textAlign: "right" }}>Spend (today)</th>
                    <th style={{ padding: "10px 20px", fontWeight: 600, textAlign: "right" }}>Spend (total)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.map((r, i) => (
                    <tr key={r.user_id} style={{ borderTop: "1px solid rgba(83,88,98,0.08)" }}>
                      <td style={{ padding: "12px 20px", color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</td>
                      <td style={{ padding: "12px 20px", color: "var(--foreground)", fontWeight: 500 }}>
                        {r.email ?? <span style={{ color: "var(--muted-foreground)" }}>{r.user_id.slice(0, 8)}…</span>}
                      </td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.exams_today}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.exams_total}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>{usd(r.cost_usd_today)}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--foreground)" }}>{usd(r.cost_usd_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
