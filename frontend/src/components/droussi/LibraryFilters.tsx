import { CalendarRange, Filter } from "lucide-react";
import type { DateFilter, DatePreset, SortOption } from "../../lib/libraryFilters";
import { subjectStyle } from "../../lib/subjects";

export interface GenreCount {
  subject: string;
  count: number;
}

interface GenreSpacesProps {
  genres: GenreCount[];
  selected: string; // "all" or subject name
  onSelect: (subject: string) => void;
  allLabel: string;
  spacesLabel: string;
}

/** Left-rail / chip strip of dedicated genre spaces with counts. */
export function GenreSpaces({
  genres,
  selected,
  onSelect,
  allLabel,
  spacesLabel,
}: GenreSpacesProps) {
  const total = genres.reduce((s, g) => s + g.count, 0);

  return (
    <aside
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 24,
        border: "1px solid var(--border)",
        padding: 16,
        alignSelf: "start",
        position: "sticky",
        top: 80,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Filter size={12} /> {spacesLabel}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <GenreSpaceButton
          label={allLabel}
          count={total}
          active={selected === "all"}
          onClick={() => onSelect("all")}
        />
        {genres.map((g) => {
          const style = subjectStyle(g.subject);
          return (
            <GenreSpaceButton
              key={g.subject}
              label={g.subject}
              count={g.count}
              active={selected === g.subject}
              onClick={() => onSelect(g.subject)}
              accent={style}
            />
          );
        })}
      </div>
    </aside>
  );
}

function GenreSpaceButton({
  label,
  count,
  active,
  onClick,
  accent,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  accent?: { bg: string; color: string };
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: "9px 12px",
        borderRadius: 12,
        border: active ? "1px solid transparent" : "1px solid transparent",
        backgroundColor: active ? "var(--secondary)" : "transparent",
        color: active ? "var(--foreground)" : "var(--text-secondary)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        fontFamily: "'Geist','Inter',sans-serif",
      }}
      className="dr-hover-secondary"
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {accent && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              backgroundColor: accent.color,
              flexShrink: 0,
            }}
          />
        )}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: active ? "var(--brand)" : "var(--muted-foreground)",
          backgroundColor: active ? "var(--card)" : "var(--muted)",
          borderRadius: 9999,
          padding: "1px 7px",
          flexShrink: 0,
        }}
      >
        {count}
      </span>
    </button>
  );
}

/** Horizontal genre chips for narrow viewports. */
export function GenreSpacesMobile({
  genres,
  selected,
  onSelect,
  allLabel,
}: Omit<GenreSpacesProps, "spacesLabel">) {
  const total = genres.reduce((s, g) => s + g.count, 0);
  const items = [{ subject: "all", count: total, label: allLabel }, ...genres.map((g) => ({ ...g, label: g.subject }))];

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 4,
        marginBottom: 16,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {items.map((item) => {
        const active = selected === item.subject;
        return (
          <button
            key={item.subject}
            type="button"
            onClick={() => onSelect(item.subject)}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 9999,
              border: active ? "none" : "1px solid var(--border)",
              backgroundColor: active ? "var(--primary)" : "var(--card)",
              color: active ? "var(--primary-foreground)" : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'Geist','Inter',sans-serif",
            }}
          >
            {item.label} ({item.count})
          </button>
        );
      })}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 140 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "9px 12px",
          borderRadius: 12,
          border: "1px solid var(--border-strong)",
          backgroundColor: "var(--card)",
          color: "var(--foreground)",
          fontSize: 13,
          fontFamily: "'Geist','Inter',sans-serif",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface DateFilterControlsProps {
  filter: DateFilter;
  onChange: (f: DateFilter) => void;
  labels: {
    date: string;
    all: string;
    today: string;
    week: string;
    month: string;
    year: string;
    custom: string;
    from: string;
    to: string;
  };
}

export function DateFilterControls({ filter, onChange, labels }: DateFilterControlsProps) {
  const presets: { value: DatePreset; label: string }[] = [
    { value: "all", label: labels.all },
    { value: "today", label: labels.today },
    { value: "week", label: labels.week },
    { value: "month", label: labels.month },
    { value: "year", label: labels.year },
    { value: "custom", label: labels.custom },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end" }}>
      <FilterSelect
        label={labels.date}
        value={filter.preset}
        onChange={(v) =>
          onChange({
            ...filter,
            preset: v as DatePreset,
          })
        }
        options={presets}
      />
      {filter.preset === "custom" && (
        <>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {labels.from}
            </span>
            <input
              type="date"
              value={filter.from ?? ""}
              onChange={(e) => onChange({ ...filter, from: e.target.value })}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                fontSize: 13,
                fontFamily: "'Geist','Inter',sans-serif",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {labels.to}
            </span>
            <input
              type="date"
              value={filter.to ?? ""}
              onChange={(e) => onChange({ ...filter, to: e.target.value })}
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                fontSize: 13,
                fontFamily: "'Geist','Inter',sans-serif",
              }}
            />
          </label>
        </>
      )}
      {filter.preset !== "all" && filter.preset !== "custom" && (
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted-foreground)", paddingBottom: 10 }}>
          <CalendarRange size={12} />
        </span>
      )}
    </div>
  );
}

export function sortOptions(labels: {
  newest: string;
  oldest: string;
  nameAsc: string;
  nameDesc: string;
}): { value: SortOption; label: string }[] {
  return [
    { value: "newest", label: labels.newest },
    { value: "oldest", label: labels.oldest },
    { value: "name_asc", label: labels.nameAsc },
    { value: "name_desc", label: labels.nameDesc },
  ];
}
