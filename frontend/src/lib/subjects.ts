/** Canonical subject / genre list used at upload and in library filters. */
export const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "Literature",
  "Computer Science",
  "Arabic",
  "French",
  "English",
  "General",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  Mathematics: { bg: "var(--secondary)", color: "var(--brand)" },
  Biology: { bg: "#d3f6e3", color: "#1aa06d" },
  Chemistry: { bg: "#f1e6ff", color: "#9552e0" },
  Physics: { bg: "var(--chip-pdf-bg)", color: "#bb9915" },
  History: { bg: "#ffd1b8", color: "#e05a00" },
  Geography: { bg: "#d4f1f9", color: "#0b7a8f" },
  Literature: { bg: "var(--muted)", color: "var(--text-secondary)" },
  "Computer Science": { bg: "#dde7ff", color: "#3b5bdb" },
  Arabic: { bg: "#fff0d6", color: "#b86e00" },
  French: { bg: "#ffe0e8", color: "#c2255c" },
  English: { bg: "#e3fafc", color: "#0c8599" },
  General: { bg: "var(--muted)", color: "var(--text-secondary)" },
};

export function subjectStyle(subject: string): { bg: string; color: string } {
  return SUBJECT_COLORS[subject] ?? { bg: "var(--muted)", color: "var(--text-secondary)" };
}

/** Stable order: known subjects first (upload order), then any extras A–Z. */
export function sortSubjects(subjects: string[]): string[] {
  const known = new Set<string>(SUBJECTS);
  const presentKnown = SUBJECTS.filter((s) => subjects.includes(s));
  const extras = subjects
    .filter((s) => !known.has(s))
    .sort((a, b) => a.localeCompare(b));
  return [...presentKnown, ...extras];
}
