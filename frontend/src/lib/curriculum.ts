/**
 * Tunisian education curriculum — mirrors backend/app/curriculum/tunisia.py.
 * Used by the exam builder to filter levels / exam types by cycle
 * (primaire → collège → lycée → enseignement supérieur).
 */

export type EducationCycle = "primaire" | "base" | "secondaire" | "superieur";

export type ExamType =
  | "generic"
  | "dc"
  | "ds"
  | "dm"
  | "bac_blanc"
  | "concours_6"
  | "concours_9"
  | "partiel"
  | "final"
  | "rattrapage"
  | "tp_eval"
  | "oral";

export type SchoolLevel =
  | "primaire_1"
  | "primaire_2"
  | "primaire_3"
  | "primaire_4"
  | "primaire_5"
  | "primaire_6"
  | "base_7"
  | "base_8"
  | "base_9"
  | "sec_1"
  | "sec_2"
  | "sec_3"
  | "sec_4"
  | "lic_1"
  | "lic_2"
  | "lic_3"
  | "mast_1"
  | "mast_2"
  | "prep_1"
  | "prep_2"
  | "ing_1"
  | "ing_2"
  | "ing_3"
  | "doctorat"
  | "other_sup";

export type Section =
  | "lettres"
  | "sciences_exp"
  | "mathematiques"
  | "sciences_techniques"
  | "economie_gestion"
  | "informatique"
  | "sport";

export type UiLang = "en" | "fr" | "ar";

export const CYCLES: EducationCycle[] = [
  "primaire",
  "base",
  "secondaire",
  "superieur",
];

export const LEVELS_BY_CYCLE: Record<EducationCycle, SchoolLevel[]> = {
  primaire: [
    "primaire_1",
    "primaire_2",
    "primaire_3",
    "primaire_4",
    "primaire_5",
    "primaire_6",
  ],
  base: ["base_7", "base_8", "base_9"],
  secondaire: ["sec_1", "sec_2", "sec_3", "sec_4"],
  superieur: [
    "lic_1",
    "lic_2",
    "lic_3",
    "mast_1",
    "mast_2",
    "prep_1",
    "prep_2",
    "ing_1",
    "ing_2",
    "ing_3",
    "doctorat",
    "other_sup",
  ],
};

export const EXAM_TYPES_BY_CYCLE: Record<EducationCycle, ExamType[]> = {
  primaire: ["generic", "dc", "ds", "dm", "concours_6"],
  base: ["generic", "dc", "ds", "dm", "concours_9"],
  secondaire: ["generic", "dc", "ds", "dm", "bac_blanc"],
  superieur: ["generic", "partiel", "final", "rattrapage", "tp_eval", "oral", "dm"],
};

export const SECTIONS: Section[] = [
  "lettres",
  "sciences_exp",
  "mathematiques",
  "sciences_techniques",
  "economie_gestion",
  "informatique",
  "sport",
];

/** Bac sections apply from 2ème secondaire onward. */
export function sectionApplies(level: SchoolLevel | "" | null): boolean {
  return level === "sec_2" || level === "sec_3" || level === "sec_4";
}

export function cycleForLevel(level: SchoolLevel | "" | null): EducationCycle | null {
  if (!level) return null;
  for (const cycle of CYCLES) {
    if (LEVELS_BY_CYCLE[cycle].includes(level)) return cycle;
  }
  return null;
}

const CYCLE_LABELS: Record<UiLang, Record<EducationCycle, string>> = {
  en: {
    primaire: "Primary",
    base: "Collège",
    secondaire: "Secondary (lycée)",
    superieur: "University / Engineering",
  },
  fr: {
    primaire: "Primaire",
    base: "Collège",
    secondaire: "Secondaire (lycée)",
    superieur: "Supérieur (faculté / ingénieurs)",
  },
  ar: {
    primaire: "ابتدائي",
    base: "إعدادي",
    secondaire: "ثانوي",
    superieur: "تعليم عالٍ (كلية / هندسة)",
  },
};

const LEVEL_LABELS: Record<UiLang, Record<SchoolLevel, string>> = {
  en: {
    primaire_1: "1st year primary",
    primaire_2: "2nd year primary",
    primaire_3: "3rd year primary",
    primaire_4: "4th year primary",
    primaire_5: "5th year primary",
    primaire_6: "6th year primary",
    base_7: "7th year",
    base_8: "8th year",
    base_9: "9th year",
    sec_1: "1st year secondary",
    sec_2: "2nd year secondary",
    sec_3: "3rd year secondary",
    sec_4: "4th year (bac)",
    lic_1: "Licence 1 (L1)",
    lic_2: "Licence 2 (L2)",
    lic_3: "Licence 3 (L3)",
    mast_1: "Master 1 (M1)",
    mast_2: "Master 2 (M2)",
    prep_1: "Prep year 1",
    prep_2: "Prep year 2",
    ing_1: "Engineering year 1",
    ing_2: "Engineering year 2",
    ing_3: "Engineering year 3",
    doctorat: "Doctorate",
    other_sup: "Other higher ed",
  },
  fr: {
    primaire_1: "1ère année primaire",
    primaire_2: "2ème année primaire",
    primaire_3: "3ème année primaire",
    primaire_4: "4ème année primaire",
    primaire_5: "5ème année primaire",
    primaire_6: "6ème année primaire",
    base_7: "7ème année",
    base_8: "8ème année",
    base_9: "9ème année",
    sec_1: "1ère année secondaire",
    sec_2: "2ème année secondaire",
    sec_3: "3ème année secondaire",
    sec_4: "4ème année (Bac)",
    lic_1: "Licence 1 (L1)",
    lic_2: "Licence 2 (L2)",
    lic_3: "Licence 3 (L3)",
    mast_1: "Master 1 (M1)",
    mast_2: "Master 2 (M2)",
    prep_1: "1ère année prépa",
    prep_2: "2ème année prépa",
    ing_1: "1ère année ingénieur",
    ing_2: "2ème année ingénieur",
    ing_3: "3ème année ingénieur",
    doctorat: "Doctorat",
    other_sup: "Autre (formation continue…)",
  },
  ar: {
    primaire_1: "السنة 1 ابتدائي",
    primaire_2: "السنة 2 ابتدائي",
    primaire_3: "السنة 3 ابتدائي",
    primaire_4: "السنة 4 ابتدائي",
    primaire_5: "السنة 5 ابتدائي",
    primaire_6: "السنة 6 ابتدائي",
    base_7: "السنة 7 أساسي",
    base_8: "السنة 8 أساسي",
    base_9: "السنة 9 أساسي",
    sec_1: "السنة 1 ثانوي",
    sec_2: "السنة 2 ثانوي",
    sec_3: "السنة 3 ثانوي",
    sec_4: "السنة 4 (باك)",
    lic_1: "إجازة 1 (L1)",
    lic_2: "إجازة 2 (L2)",
    lic_3: "إجازة 3 (L3)",
    mast_1: "ماجستير 1 (M1)",
    mast_2: "ماجستير 2 (M2)",
    prep_1: "تحضيري 1",
    prep_2: "تحضيري 2",
    ing_1: "هندسة 1",
    ing_2: "هندسة 2",
    ing_3: "هندسة 3",
    doctorat: "دكتوراه",
    other_sup: "أخرى",
  },
};

const EXAM_TYPE_LABELS: Record<UiLang, Record<ExamType, string>> = {
  en: {
    generic: "Generic exam",
    dc: "Devoir de contrôle",
    ds: "Devoir de synthèse",
    dm: "Devoir de maison",
    bac_blanc: "Bac blanc",
    concours_6: "Concours 6ème",
    concours_9: "Concours 9ème",
    partiel: "Midterm (partiel)",
    final: "Final exam",
    rattrapage: "Resit (rattrapage)",
    tp_eval: "Lab / TP assessment",
    oral: "Oral exam",
  },
  fr: {
    generic: "Examen générique",
    dc: "Devoir de contrôle",
    ds: "Devoir de synthèse",
    dm: "Devoir de maison",
    bac_blanc: "Bac blanc",
    concours_6: "Concours 6ème",
    concours_9: "Concours 9ème",
    partiel: "Partiel",
    final: "Examen final",
    rattrapage: "Rattrapage",
    tp_eval: "Évaluation de TP",
    oral: "Examen oral",
  },
  ar: {
    generic: "امتحان عام",
    dc: "فرض مراقبة",
    ds: "فرض تأليفي",
    dm: "فرض منزلي",
    bac_blanc: "باك تجريبية",
    concours_6: "مناظرة 6 أساسي",
    concours_9: "مناظرة 9 أساسي",
    partiel: "امتحان جزئي",
    final: "امتحان نهائي",
    rattrapage: "تدارك",
    tp_eval: "تقييم أشغال تطبيقية",
    oral: "امتحان شفاهي",
  },
};

const SECTION_LABELS: Record<UiLang, Record<Section, string>> = {
  en: {
    lettres: "Literature",
    sciences_exp: "Experimental sciences",
    mathematiques: "Mathematics",
    sciences_techniques: "Technical sciences",
    economie_gestion: "Economics & management",
    informatique: "Computer science",
    sport: "Sport",
  },
  fr: {
    lettres: "Lettres",
    sciences_exp: "Sciences expérimentales",
    mathematiques: "Mathématiques",
    sciences_techniques: "Sciences techniques",
    economie_gestion: "Économie et gestion",
    informatique: "Informatique",
    sport: "Sport",
  },
  ar: {
    lettres: "آداب",
    sciences_exp: "علوم تجريبية",
    mathematiques: "رياضيات",
    sciences_techniques: "علوم تقنية",
    economie_gestion: "اقتصاد وتصرف",
    informatique: "إعلامية",
    sport: "رياضة",
  },
};

export function cycleLabel(lang: UiLang, cycle: EducationCycle): string {
  return CYCLE_LABELS[lang][cycle];
}

export function levelLabel(lang: UiLang, level: SchoolLevel): string {
  return LEVEL_LABELS[lang][level];
}

export function examTypeLabel(lang: UiLang, type: ExamType): string {
  return EXAM_TYPE_LABELS[lang][type];
}

export function sectionLabel(lang: UiLang, section: Section): string {
  return SECTION_LABELS[lang][section];
}

/** Default duration (minutes) by exam type. */
export function defaultDuration(examType: ExamType, cycle: EducationCycle | null): number {
  if (examType === "final" || examType === "rattrapage" || examType === "bac_blanc") return 120;
  if (examType === "oral" || examType === "tp_eval") return 90;
  if (examType === "partiel" || examType === "ds") return 90;
  if (cycle === "superieur") return 90;
  return 60;
}
