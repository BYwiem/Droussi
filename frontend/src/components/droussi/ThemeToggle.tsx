import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";

/** Compact sun/moon control for the nav (and landing header). */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLanguage();
  const t = createT(lang);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("theme_to_light") : t("theme_to_dark")}
      title={isDark ? t("theme_to_light") : t("theme_to_dark")}
      style={{
        width: 36,
        height: 36,
        borderRadius: 9999,
        border: "1px solid var(--border-strong)",
        backgroundColor: "var(--muted)",
        color: "var(--foreground)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {isDark ? <Sun size={16} strokeWidth={2.25} /> : <Moon size={16} strokeWidth={2.25} />}
    </button>
  );
}
