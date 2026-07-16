import { Check, Sparkles } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";
import { openBillingPortal, startCheckout } from "../../lib/api";
import type { Plan } from "../../types";

interface PricingPageProps {
  plan: Plan;
  /** When true, hide the Upgrade button (already Pro). */
  loading?: boolean;
}

export function PricingPage({ plan, loading }: PricingPageProps) {
  const { lang } = useLanguage();
  const t = createT(lang);
  const isPro = plan === "pro";

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--brand)",
            marginBottom: 10,
          }}
        >
          {t("pricing_eyebrow")}
        </p>
        <h1
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--foreground)",
            marginBottom: 10,
          }}
        >
          {t("pricing_title")}
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
          {t("pricing_desc")}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {/* Free */}
        <div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: 28,
            border: "1px solid var(--border)",
            padding: 28,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            {t("pricing_free_name")}
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 20 }}>{t("pricing_free_tag")}</p>
          <p style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: "var(--foreground)" }}>$0</span>
            <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>/{t("pricing_mo")}</span>
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[t("pricing_free_f1"), t("pricing_free_f2"), t("pricing_free_f3")].map((f) => (
              <li key={f} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                <Check size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                borderRadius: 9999,
                backgroundColor: "var(--muted)",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              {t("pricing_current")}
            </div>
          )}
        </div>

        {/* Pro */}
        <div
          style={{
            backgroundColor: "var(--pro-surface)",
            borderRadius: 28,
            padding: 28,
            color: "var(--pro-surface-fg)",
            position: "relative",
            boxShadow: "0 20px 40px var(--shadow-strong)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 9999,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Sparkles size={12} /> {t("pricing_popular")}
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t("pricing_pro_name")}</h2>
          <p style={{ fontSize: 14, color: "var(--pro-surface-muted)", marginBottom: 20 }}>
            {t("pricing_pro_tag")}
          </p>
          <p style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>$9</span>
            <span style={{ fontSize: 14, color: "var(--pro-surface-muted)" }}>/{t("pricing_mo")}</span>
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[t("pricing_pro_f1"), t("pricing_pro_f2"), t("pricing_pro_f3"), t("pricing_pro_f4")].map(
              (f) => (
                <li key={f} style={{ display: "flex", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                  <Check size={16} color="#7dd3fc" style={{ flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              )
            )}
          </ul>
          {isPro ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => void openBillingPortal()}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 9999,
                border: "1px solid rgba(255,255,255,0.25)",
                backgroundColor: "transparent",
                color: "var(--pro-surface-fg)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("pricing_manage")}
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => void startCheckout()}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 9999,
                border: "none",
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("pricing_upgrade")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
