import { ChevronDown, CreditCard, LogOut, Menu, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { deleteMyData, openBillingPortal, startCheckout } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { createT, LANG_LABELS, type Lang } from "../../lib/i18n";
import type { Plan } from "../../types";
import { ThemeToggle } from "./ThemeToggle";
import { UserInitialsAvatar } from "./UserInitialsAvatar";

interface NavBarProps {
  user: { name: string; email: string } | null;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  extra?: React.ReactNode;
  isAdmin?: boolean;
  plan?: Plan;
}

export function NavBar({
  user,
  currentPage,
  onNavigate,
  onLogout,
  extra,
  isAdmin,
  plan = "free",
}: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { lang, setLang } = useLanguage();
  const t = createT(lang);

  async function handleDeleteData() {
    const confirmed = window.confirm(t("acct_delete_confirm"));
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteMyData();
      await supabase.auth.signOut();
    } finally {
      setDeleting(false);
    }
  }

  const navLinks = [
    { id: "dashboard", label: t("nav_dashboard") },
    { id: "upload", label: t("nav_upload") },
    { id: "exam", label: t("nav_exam") },
    { id: "repository", label: t("nav_repository") },
    { id: "outputs", label: t("nav_outputs") },
    { id: "pricing", label: t("nav_pricing") },
    ...(isAdmin ? [{ id: "admin", label: "Admin" }] : []),
  ];

  const planLabel = plan === "pro" ? t("plan_pro") : t("plan_free");

  return (
    <nav
      style={{ backgroundColor: "var(--nav-bg)", backdropFilter: "blur(12px)" }}
      className="sticky top-0 z-50 border-b border-[color:var(--border)]"
    >
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 group"
        >
          {/* <div
            style={{ backgroundColor: "var(--brand)", borderRadius: 10 }}
            className="w-8 h-8 flex items-center justify-center shadow-sm"
          >
            <BookOpen size={16} color="#fff" strokeWidth={2.5} />
          </div> */}
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 18,
              color: "var(--foreground)",
              letterSpacing: "-0.02em",
            }}
          >
            Droussi
          </span>
        </button>

        {/* Desktop Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                style={{
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: currentPage === link.id ? "var(--foreground)" : "var(--text-secondary)",
                  letterSpacing: "-0.01em",
                  backgroundColor: currentPage === link.id ? "var(--secondary)" : "transparent",
                  borderRadius: 9999,
                  padding: "6px 14px",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
                className="dr-hover-secondary"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={() => onNavigate("pricing")}
              aria-label={planLabel}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "5px 10px",
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                backgroundColor: plan === "pro" ? "var(--primary)" : "var(--secondary)",
                color: plan === "pro" ? "var(--primary-foreground)" : "var(--brand)",
              }}
            >
              {planLabel}
            </button>
          )}
          <ThemeToggle />
          {/* Language toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--muted)",
              borderRadius: 9999,
              padding: 3,
              gap: 2,
            }}
          >
            {(["en", "fr", "ar"] as const).map((l: Lang) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                aria-label={`Language: ${l.toUpperCase()}`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 9999,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: lang === l ? "var(--primary)" : "transparent",
                  color: lang === l ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  transition: "background-color 0.12s ease, color 0.12s ease",
                  fontFamily: "'Geist','Inter',sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {extra && <div className="hidden lg:block">{extra}</div>}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Account menu"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[var(--secondary)]/60 transition-colors"
              >
                <UserInitialsAvatar name={user.name} size={32} />
                <span
                  style={{
                    fontFamily: "'Geist', 'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--foreground)",
                    letterSpacing: "-0.01em",
                  }}
                  className="hidden sm:block"
                >
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown size={14} color="var(--text-secondary)" />
              </button>
              {profileOpen && (
                <div
                  style={{
                    backgroundColor: "var(--card)",
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow) 0px 14px 20px 4px",
                    minWidth: 200,
                  }}
                  className="absolute right-0 top-full mt-2 p-2 z-50"
                >
                  <div className="px-3 py-2 mb-1">
                    <p style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{user.name}</p>
                    <p style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 12, color: "var(--muted-foreground)" }}>{user.email}</p>
                  </div>
                  <div style={{ height: 1, backgroundColor: "var(--border)" }} className="mb-1" />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      if (plan === "pro") void openBillingPortal();
                      else void startCheckout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--muted)] transition-colors text-left"
                  >
                    <CreditCard size={14} color="var(--text-secondary)" />
                    <span style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                      {plan === "pro" ? t("pricing_manage") : t("pricing_upgrade")}
                    </span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--muted)] transition-colors text-left"
                  >
                    <LogOut size={14} color="var(--text-secondary)" />
                    <span style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{t("nav_signout")}</span>
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); void handleDeleteData(); }}
                    disabled={deleting}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#fdecec] transition-colors text-left"
                  >
                    <Trash2 size={14} color="var(--danger)" />
                    <span style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: 14, fontWeight: 500, color: "var(--danger)" }}>{deleting ? t("acct_deleting") : t("acct_delete_data")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "'Geist','Inter',sans-serif",
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                borderRadius: 9999,
                padding: "8px 20px",
              }}
              className="hover:bg-[#2d3444] transition-colors"
            >
              Sign in
            </button>
          )}

          {/* Mobile menu toggle */}
          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden p-2 rounded-xl hover:bg-[var(--secondary)]/60 transition-colors"
            >
              {menuOpen ? <X size={20} color="var(--foreground)" /> : <Menu size={20} color="var(--foreground)" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div
          style={{ backgroundColor: "var(--card)", borderTop: "1px solid var(--border)" }}
          className="md:hidden px-6 pb-4 pt-2"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { onNavigate(link.id); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--secondary)]/60 transition-colors"
              style={{
                fontFamily: "'Geist','Inter',sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: currentPage === link.id ? "var(--foreground)" : "var(--text-secondary)",
                backgroundColor: currentPage === link.id ? "var(--secondary)" : undefined,
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
