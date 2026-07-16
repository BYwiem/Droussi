import { CheckCircle, FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { createT } from "../../lib/i18n";
import { sortSubjects, subjectStyle } from "../../lib/subjects";

export interface PickerDocument {
  id: string;
  name: string;
  subject: string;
}

interface DocumentPickerModalProps {
  documents: PickerDocument[];
  selectedIds: string[];
  maxSelection: number;
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

/**
 * Modal to multi-select source documents from the user's repository.
 * Selection is drafted locally and applied only when the user confirms.
 */
export function DocumentPickerModal({
  documents,
  selectedIds,
  maxSelection,
  onConfirm,
  onClose,
}: DocumentPickerModalProps) {
  const { lang } = useLanguage();
  const t = createT(lang);
  const [closing, setClosing] = useState(false);
  const [draft, setDraft] = useState<string[]>(selectedIds);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");

  useEffect(() => {
    setDraft(selectedIds);
  }, [selectedIds]);

  const genres = useMemo(() => {
    const set = new Set(documents.map((d) => d.subject || "General"));
    return sortSubjects([...set]);
  }, [documents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      const matchSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q);
      const matchGenre = genre === "all" || d.subject === genre;
      return matchSearch && matchGenre;
    });
  }, [documents, search, genre]);

  const atMax = draft.length >= maxSelection;

  const toggle = (id: string) => {
    setDraft((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelection) return prev;
      return [...prev, id];
    });
  };

  const requestClose = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      onClose();
      return;
    }
    setClosing(true);
  };

  const handleAnimationEnd = () => {
    if (closing) onClose();
  };

  return (
    <div
      className="mffb-backdrop"
      data-closing={closing}
      onClick={requestClose}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 1000,
      }}
    >
      <div
        className="mffb-modal"
        data-closing={closing}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        style={{
          position: "relative",
          backgroundColor: "var(--card)",
          borderRadius: 28,
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-strong) 0px 24px 48px 8px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "'Geist','Inter',sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--foreground)",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {t("eg_picker_title")}
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>
              {t("eg_picker_desc").replace("{max}", String(maxSelection))}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={t("eg_picker_cancel")}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              border: "none",
              backgroundColor: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: "14px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="var(--muted-foreground)"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("eg_picker_search")}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                borderRadius: 12,
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--background)",
                fontSize: 13,
                color: "var(--foreground)",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 2,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <GenreChip
              label={t("filter_genre_all")}
              active={genre === "all"}
              onClick={() => setGenre("all")}
            />
            {genres.map((g) => (
              <GenreChip
                key={g}
                label={g}
                active={genre === g}
                onClick={() => setGenre(g)}
                color={subjectStyle(g).color}
              />
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 8px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 12px" }}>
              <FileText size={32} color="var(--muted-foreground)" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                {t("eg_picker_empty")}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((file) => {
                const selected = draft.includes(file.id);
                const blocked = !selected && atMax;
                const style = subjectStyle(file.subject);
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => toggle(file.id)}
                    disabled={blocked}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 14,
                      border: `1.5px solid ${selected ? "var(--brand)" : "var(--border)"}`,
                      backgroundColor: selected
                        ? "var(--secondary)"
                        : blocked
                          ? "var(--muted)"
                          : "var(--background)",
                      cursor: blocked ? "not-allowed" : "pointer",
                      opacity: blocked ? 0.55 : 1,
                      textAlign: "left",
                      transition: "border-color 0.12s ease, background-color 0.12s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: selected ? "var(--card)" : "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={16} color={selected ? "var(--brand)" : "var(--muted-foreground)"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          margin: 0,
                        }}
                      >
                        {file.name}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: style.color,
                          backgroundColor: style.bg,
                          borderRadius: 9999,
                          padding: "1px 8px",
                        }}
                      >
                        {file.subject}
                      </span>
                    </div>
                    {selected ? (
                      <CheckCircle size={18} color="var(--brand)" />
                    ) : (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 6,
                          border: "1.5px solid var(--border-strong)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px 20px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: atMax ? "#e05a00" : "var(--muted-foreground)",
            }}
          >
            {draft.length}/{maxSelection} {t("eg_picker_selected")}
            {atMax ? ` — ${t("eg_max_materials")}` : ""}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={requestClose}
              style={{
                padding: "10px 18px",
                borderRadius: 9999,
                border: "1px solid var(--border-strong)",
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("eg_picker_cancel")}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(draft)}
              disabled={draft.length === 0}
              style={{
                padding: "10px 20px",
                borderRadius: 9999,
                border: "none",
                backgroundColor: draft.length === 0 ? "var(--muted-foreground)" : "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: 13,
                fontWeight: 600,
                cursor: draft.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {t("eg_picker_confirm")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenreChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "6px 12px",
        borderRadius: 9999,
        border: active ? "none" : "1px solid var(--border)",
        backgroundColor: active ? "var(--primary)" : "var(--muted)",
        color: active ? "var(--primary-foreground)" : "var(--text-secondary)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {color && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            backgroundColor: active ? "var(--primary-foreground)" : color,
          }}
        />
      )}
      {label}
    </button>
  );
}
