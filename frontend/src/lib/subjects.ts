/** Canonical subject / module list for Tunisian school + university. */
export const SUBJECTS = [
  // Languages & humanities
  "Arabe",
  "Français",
  "Anglais",
  "Histoire-Géographie",
  "Éducation islamique",
  "Éducation civique",
  "Philosophie",
  // STEM (school + fac)
  "Mathématiques",
  "Sciences physiques",
  "SVT",
  "Informatique",
  "Technologie",
  // Economics / management
  "Économie",
  "Gestion",
  // University / engineering modules (common)
  "Analyse",
  "Algèbre",
  "Probabilités et statistiques",
  "Algorithmique",
  "Bases de données",
  "Réseaux",
  "Électronique",
  "Mécanique",
  "Chimie",
  "Biologie",
  "Droit",
  "Médecine",
  "General",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_COLORS: Record<string, { bg: string; color: string }> = {
  Arabe: { bg: "#fff0d6", color: "#b86e00" },
  Français: { bg: "#ffe0e8", color: "#c2255c" },
  Anglais: { bg: "#e3fafc", color: "#0c8599" },
  "Histoire-Géographie": { bg: "#ffd1b8", color: "#e05a00" },
  "Éducation islamique": { bg: "#fff0d6", color: "#b86e00" },
  "Éducation civique": { bg: "#d4f1f9", color: "#0b7a8f" },
  Philosophie: { bg: "var(--muted)", color: "var(--text-secondary)" },
  Mathématiques: { bg: "var(--secondary)", color: "var(--brand)" },
  "Sciences physiques": { bg: "var(--chip-pdf-bg)", color: "#bb9915" },
  SVT: { bg: "#d3f6e3", color: "#1aa06d" },
  Informatique: { bg: "#dde7ff", color: "#3b5bdb" },
  Technologie: { bg: "#dde7ff", color: "#3b5bdb" },
  Économie: { bg: "#f1e6ff", color: "#9552e0" },
  Gestion: { bg: "#f1e6ff", color: "#9552e0" },
  Analyse: { bg: "var(--secondary)", color: "var(--brand)" },
  Algèbre: { bg: "var(--secondary)", color: "var(--brand)" },
  "Probabilités et statistiques": { bg: "var(--secondary)", color: "var(--brand)" },
  Algorithmique: { bg: "#dde7ff", color: "#3b5bdb" },
  "Bases de données": { bg: "#dde7ff", color: "#3b5bdb" },
  Réseaux: { bg: "#dde7ff", color: "#3b5bdb" },
  Électronique: { bg: "var(--chip-pdf-bg)", color: "#bb9915" },
  Mécanique: { bg: "var(--chip-pdf-bg)", color: "#bb9915" },
  Chimie: { bg: "#f1e6ff", color: "#9552e0" },
  Biologie: { bg: "#d3f6e3", color: "#1aa06d" },
  Droit: { bg: "#ffd1b8", color: "#e05a00" },
  Médecine: { bg: "#d3f6e3", color: "#1aa06d" },
  General: { bg: "var(--muted)", color: "var(--text-secondary)" },
  // Legacy English keys (existing uploads)
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
};

export function subjectStyle(subject: string): { bg: string; color: string } {
  return SUBJECT_COLORS[subject] ?? { bg: "var(--muted)", color: "var(--text-secondary)" };
}

/** Stable order: known subjects first (upload order), then any extras A–Z. */
export function sortSubjects(subjects: string[]): string[] {
  const known = new Set<string>(SUBJECTS);
  const presentKnown = SUBJECTS.filter((s) => subjects.includes(s));
  const extras = subjects
    .filter((s) => !known.has(s as Subject))
    .sort((a, b) => a.localeCompare(b));
  return [...presentKnown, ...extras];
}
