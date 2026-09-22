"""Tunisian education system: school + higher education (faculté / ingénieurs).

Covers primaire → collège → lycée → enseignement supérieur (licence, master,
prépa, cycle ingénieur, doctorat) so Droussi works for any learning grade.

School sources (Ministère de l'Éducation, circulaires du contrôle continu):
- Each trimester: 1–2 devoirs de contrôle (DC), 1 devoir de synthèse (DS),
  1 devoir de maison (DM, except sport/lettres).
- Scientific & economic streams: DC = 40% restitution/comprehension +
  60% application; DS = 20% restitution + 50% application + 30% analysis/synthesis.
- Lettres & sport: DC = 60% restitution + 40% application;
  DS = 40% restitution + 60% application.
- Papers are graded /20 with an explicit barème per exercise.

Higher education (LMD / écoles d'ingénieurs): partiels, examens finaux,
rattrapages, évaluations de TP — typically /20 with multi-part questions.
"""
from __future__ import annotations

from typing import Literal, Optional

Lang = Literal["en", "fr", "ar"]

EducationCycle = Literal["primaire", "base", "secondaire", "superieur"]

ExamType = Literal[
    "generic",
    "dc",  # devoir de contrôle (school)
    "ds",  # devoir de synthèse (school)
    "dm",  # devoir de maison
    "bac_blanc",
    "concours_6",
    "concours_9",
    # Higher education (faculté / ingénieurs)
    "partiel",
    "final",
    "rattrapage",
    "tp_eval",
    "oral",
]

SchoolLevel = Literal[
    "primaire_1",
    "primaire_2",
    "primaire_3",
    "primaire_4",
    "primaire_5",
    "primaire_6",
    "base_7",
    "base_8",
    "base_9",
    "sec_1",
    "sec_2",
    "sec_3",
    "sec_4",
    # Enseignement supérieur
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
]

Section = Literal[
    "lettres",
    "sciences_exp",
    "mathematiques",
    "sciences_techniques",
    "economie_gestion",
    "informatique",
    "sport",
]

SubjectFamily = Literal["scientific", "literary", "sport", "general"]

# Levels grouped by cycle (UI filters + prompt context).
LEVELS_BY_CYCLE: dict[EducationCycle, tuple[str, ...]] = {
    "primaire": (
        "primaire_1",
        "primaire_2",
        "primaire_3",
        "primaire_4",
        "primaire_5",
        "primaire_6",
    ),
    "base": ("base_7", "base_8", "base_9"),
    "secondaire": ("sec_1", "sec_2", "sec_3", "sec_4"),
    "superieur": (
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
    ),
}

# Exam types that apply primarily to each cycle (UI filters).
EXAM_TYPES_BY_CYCLE: dict[EducationCycle, tuple[str, ...]] = {
    "primaire": ("generic", "dc", "ds", "dm", "concours_6"),
    "base": ("generic", "dc", "ds", "dm", "concours_9"),
    "secondaire": ("generic", "dc", "ds", "dm", "bac_blanc"),
    "superieur": ("generic", "partiel", "final", "rattrapage", "tp_eval", "oral", "dm"),
}

# Bac sections only make sense from 2ème secondaire onward.
SECTIONS_APPLICABLE_LEVELS = frozenset({"sec_2", "sec_3", "sec_4"})


def cycle_for_level(level: Optional[str]) -> Optional[EducationCycle]:
    if not level:
        return None
    for cycle, levels in LEVELS_BY_CYCLE.items():
        if level in levels:
            return cycle
    return None


# --------------------------------------------------------------------------- #
# Human-readable labels (used on the exported paper and in the prompt)
# --------------------------------------------------------------------------- #

CYCLE_LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "primaire": "Primary",
        "base": "Collège (basic education)",
        "secondaire": "Secondary (lycée)",
        "superieur": "Higher education (university / engineering)",
    },
    "fr": {
        "primaire": "Primaire",
        "base": "Collège (enseignement de base)",
        "secondaire": "Secondaire (lycée)",
        "superieur": "Enseignement supérieur (faculté / ingénieurs)",
    },
    "ar": {
        "primaire": "ابتدائي",
        "base": "إعدادي (تعليم أساسي)",
        "secondaire": "ثانوي",
        "superieur": "تعليم عالٍ (كلية / هندسة)",
    },
}

EXAM_TYPE_LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "generic": "Exam",
        "dc": "Test (devoir de contrôle)",
        "ds": "Term exam (devoir de synthèse)",
        "dm": "Homework assignment (devoir de maison)",
        "bac_blanc": "Mock baccalauréat",
        "concours_6": "6th-year entrance exam (collèges pilotes)",
        "concours_9": "9th-year entrance exam (lycées pilotes)",
        "partiel": "Midterm (partiel)",
        "final": "Final exam (session principale)",
        "rattrapage": "Resit exam (session de rattrapage)",
        "tp_eval": "Lab / practical assessment (TP)",
        "oral": "Oral exam",
    },
    "fr": {
        "generic": "Examen",
        "dc": "Devoir de contrôle",
        "ds": "Devoir de synthèse",
        "dm": "Devoir de maison",
        "bac_blanc": "Bac blanc",
        "concours_6": "Concours d'entrée aux collèges pilotes",
        "concours_9": "Concours d'entrée aux lycées pilotes",
        "partiel": "Partiel (contrôle continu)",
        "final": "Examen final (session principale)",
        "rattrapage": "Examen de rattrapage",
        "tp_eval": "Évaluation de TP",
        "oral": "Examen oral",
    },
    "ar": {
        "generic": "امتحان",
        "dc": "فرض مراقبة",
        "ds": "فرض تأليفي",
        "dm": "فرض منزلي",
        "bac_blanc": "باكالوريا تجريبية",
        "concours_6": "مناظرة الدخول إلى المدارس الإعدادية النموذجية",
        "concours_9": "مناظرة الدخول إلى المعاهد النموذجية",
        "partiel": "امتحان جزئي (مراقبة مستمرة)",
        "final": "امتحان نهائي (دورة رئيسية)",
        "rattrapage": "امتحان تدارك",
        "tp_eval": "تقييم أشغال تطبيقية",
        "oral": "امتحان شفاهي",
    },
}

LEVEL_LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "primaire_1": "1st year primary",
        "primaire_2": "2nd year primary",
        "primaire_3": "3rd year primary",
        "primaire_4": "4th year primary",
        "primaire_5": "5th year primary",
        "primaire_6": "6th year primary",
        "base_7": "7th year (collège)",
        "base_8": "8th year (collège)",
        "base_9": "9th year (collège)",
        "sec_1": "1st year secondary",
        "sec_2": "2nd year secondary",
        "sec_3": "3rd year secondary",
        "sec_4": "4th year secondary (bac)",
        "lic_1": "Licence year 1 (L1)",
        "lic_2": "Licence year 2 (L2)",
        "lic_3": "Licence year 3 (L3)",
        "mast_1": "Master year 1 (M1)",
        "mast_2": "Master year 2 (M2)",
        "prep_1": "Preparatory cycle year 1",
        "prep_2": "Preparatory cycle year 2",
        "ing_1": "Engineering cycle year 1",
        "ing_2": "Engineering cycle year 2",
        "ing_3": "Engineering cycle year 3",
        "doctorat": "Doctorate",
        "other_sup": "Other higher education / continuing education",
    },
    "fr": {
        "primaire_1": "1ère année primaire",
        "primaire_2": "2ème année primaire",
        "primaire_3": "3ème année primaire",
        "primaire_4": "4ème année primaire",
        "primaire_5": "5ème année primaire",
        "primaire_6": "6ème année primaire",
        "base_7": "7ème année de base",
        "base_8": "8ème année de base",
        "base_9": "9ème année de base",
        "sec_1": "1ère année secondaire",
        "sec_2": "2ème année secondaire",
        "sec_3": "3ème année secondaire",
        "sec_4": "4ème année secondaire (Bac)",
        "lic_1": "Licence 1 (L1)",
        "lic_2": "Licence 2 (L2)",
        "lic_3": "Licence 3 (L3)",
        "mast_1": "Master 1 (M1)",
        "mast_2": "Master 2 (M2)",
        "prep_1": "1ère année cycle préparatoire",
        "prep_2": "2ème année cycle préparatoire",
        "ing_1": "1ère année cycle ingénieur",
        "ing_2": "2ème année cycle ingénieur",
        "ing_3": "3ème année cycle ingénieur",
        "doctorat": "Doctorat",
        "other_sup": "Autre (formation continue / IUT / ISSAT…)",
    },
    "ar": {
        "primaire_1": "السنة الأولى ابتدائي",
        "primaire_2": "السنة الثانية ابتدائي",
        "primaire_3": "السنة الثالثة ابتدائي",
        "primaire_4": "السنة الرابعة ابتدائي",
        "primaire_5": "السنة الخامسة ابتدائي",
        "primaire_6": "السنة السادسة ابتدائي",
        "base_7": "السنة السابعة أساسي",
        "base_8": "السنة الثامنة أساسي",
        "base_9": "السنة التاسعة أساسي",
        "sec_1": "السنة الأولى ثانوي",
        "sec_2": "السنة الثانية ثانوي",
        "sec_3": "السنة الثالثة ثانوي",
        "sec_4": "السنة الرابعة ثانوي (باكالوريا)",
        "lic_1": "إجازة سنة أولى (L1)",
        "lic_2": "إجازة سنة ثانية (L2)",
        "lic_3": "إجازة سنة ثالثة (L3)",
        "mast_1": "ماجستير سنة أولى (M1)",
        "mast_2": "ماجستير سنة ثانية (M2)",
        "prep_1": "السنة الأولى تحضيرية",
        "prep_2": "السنة الثانية تحضيرية",
        "ing_1": "السنة الأولى هندسة",
        "ing_2": "السنة الثانية هندسة",
        "ing_3": "السنة الثالثة هندسة",
        "doctorat": "دكتوراه",
        "other_sup": "أخرى (تكوين مستمر / معهد…)",
    },
}

SECTION_LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "lettres": "Literature",
        "sciences_exp": "Experimental sciences",
        "mathematiques": "Mathematics",
        "sciences_techniques": "Technical sciences",
        "economie_gestion": "Economics & management",
        "informatique": "Computer science",
        "sport": "Sport",
    },
    "fr": {
        "lettres": "Lettres",
        "sciences_exp": "Sciences expérimentales",
        "mathematiques": "Mathématiques",
        "sciences_techniques": "Sciences techniques",
        "economie_gestion": "Économie et gestion",
        "informatique": "Sciences de l'informatique",
        "sport": "Sport",
    },
    "ar": {
        "lettres": "آداب",
        "sciences_exp": "علوم تجريبية",
        "mathematiques": "رياضيات",
        "sciences_techniques": "علوم تقنية",
        "economie_gestion": "اقتصاد وتصرف",
        "informatique": "علوم الإعلامية",
        "sport": "رياضة",
    },
}

TRIMESTER_LABELS: dict[Lang, dict[int, str]] = {
    "en": {1: "1st term", 2: "2nd term", 3: "3rd term"},
    "fr": {1: "1er trimestre", 2: "2ème trimestre", 3: "3ème trimestre"},
    "ar": {1: "الثلاثي الأول", 2: "الثلاثي الثاني", 3: "الثلاثي الثالث"},
}

# Labels printed on the exported paper (header, exercises, answer key).
PAPER_LABELS: dict[Lang, dict[str, str]] = {
    "en": {
        "school": "School",
        "teacher": "Teacher",
        "school_year": "School year",
        "subject": "Subject",
        "level": "Level",
        "duration": "Duration",
        "minutes": "min",
        "student_name": "Name & surname",
        "class": "Class",
        "grade": "Grade",
        "exercise": "Exercise",
        "points": "pts",
        "total": "Total",
        "answer_key": "Answer key & marking scheme",
        "explanation": "Explanation",
        "true": "True",
        "false": "False",
        "type_mcq": "MCQ",
        "type_true_false": "True / False",
        "type_short": "Short answer",
        "type_essay": "Essay",
        "type_open": "Open question",
    },
    "fr": {
        "school": "Établissement",
        "teacher": "Enseignant(e)",
        "school_year": "Année scolaire",
        "subject": "Matière",
        "level": "Niveau",
        "duration": "Durée",
        "minutes": "min",
        "student_name": "Nom & Prénom",
        "class": "Classe",
        "grade": "Note",
        "exercise": "Exercice N°",
        "points": "points",
        "total": "Total",
        "answer_key": "Corrigé et barème",
        "explanation": "Explication",
        "true": "Vrai",
        "false": "Faux",
        "type_mcq": "QCM",
        "type_true_false": "Vrai / Faux",
        "type_short": "Réponse courte",
        "type_essay": "Rédaction",
        "type_open": "Question ouverte",
    },
    "ar": {
        "school": "المؤسسة",
        "teacher": "الأستاذ(ة)",
        "school_year": "السنة الدراسية",
        "subject": "المادة",
        "level": "المستوى",
        "duration": "المدة",
        "minutes": "دق",
        "student_name": "الاسم واللقب",
        "class": "القسم",
        "grade": "العدد",
        "exercise": "التمرين عدد",
        "points": "نقاط",
        "total": "المجموع",
        "answer_key": "الإصلاح وسلّم التنقيط",
        "explanation": "التعليل",
        "true": "صحيح",
        "false": "خطأ",
        "type_mcq": "اختيار من متعدد",
        "type_true_false": "صحيح / خطأ",
        "type_short": "إجابة قصيرة",
        "type_essay": "إنتاج كتابي",
        "type_open": "سؤال مفتوح",
    },
}


def label(table: dict[Lang, dict], lang: str, key, default: str = "") -> str:
    """Look up ``key`` in ``table`` for ``lang``, falling back to French then English."""
    for candidate in (lang, "fr", "en"):
        row = table.get(candidate)  # type: ignore[arg-type]
        if row and key in row:
            return row[key]
    return default


# --------------------------------------------------------------------------- #
# Subject family detection
# --------------------------------------------------------------------------- #

# Keywords are matched case-insensitively against the free-text subject name in
# any of the three UI languages. Order matters: first family with a hit wins.
_FAMILY_KEYWORDS: list[tuple[SubjectFamily, tuple[str, ...]]] = [
    (
        "sport",
        ("sport", "éducation physique", "education physique", "تربية بدنية", "رياضة"),
    ),
    (
        "scientific",
        (
            "math",
            "رياضيات",
            "physique",
            "physics",
            "فيزياء",
            "علوم فيزيائية",
            "chimie",
            "chemistry",
            "svt",
            "sciences de la vie",
            "biolog",
            "علوم الحياة",
            "علوم طبيعية",
            "informatique",
            "computer",
            "إعلامية",
            "technolog",
            "تكنولوجيا",
            "économie",
            "economie",
            "economics",
            "gestion",
            "اقتصاد",
            "تصرف",
            "science",
            "علوم",
        ),
    ),
    (
        "literary",
        (
            "arabe",
            "arabic",
            "عربية",
            "français",
            "francais",
            "french",
            "فرنسية",
            "anglais",
            "english",
            "أنقليزية",
            "انجليزية",
            "histoire",
            "history",
            "تاريخ",
            "géographie",
            "geographie",
            "geography",
            "جغرافيا",
            "philosophie",
            "philosophy",
            "فلسفة",
            "islamique",
            "islamic",
            "إسلامية",
            "civique",
            "civic",
            "مدنية",
            "littérature",
            "literature",
            "أدب",
            "pensée",
            "تفكير",
        ),
    ),
]


def subject_family(subject: Optional[str], section: Optional[str] = None) -> SubjectFamily:
    """Classify a subject (and optionally the student's section) into a grading family."""
    text = (subject or "").strip().lower()
    if text:
        for family, keywords in _FAMILY_KEYWORDS:
            if any(k in text for k in keywords):
                return family
    if section == "sport":
        return "sport"
    if section == "lettres":
        return "literary"
    if section in {
        "sciences_exp",
        "mathematiques",
        "sciences_techniques",
        "economie_gestion",
        "informatique",
    }:
        return "scientific"
    return "general"


# --------------------------------------------------------------------------- #
# Official assessment rules → prompt guidance
# --------------------------------------------------------------------------- #

_PROPORTIONS: dict[tuple[str, str], str] = {
    ("dc", "scientific"): (
        "Official weighting for a devoir de contrôle in scientific/economic streams: "
        "about 40% of the marks on recall and comprehension of the most recent lessons, "
        "about 60% on application of knowledge (calculations, standard exercises)."
    ),
    ("ds", "scientific"): (
        "Official weighting for a devoir de synthèse in scientific/economic streams: "
        "about 20% of the marks on recall and comprehension, 50% on application, and "
        "30% on analysis and synthesis of situations (problems, document analysis, "
        "justified reasoning). It covers the whole term's lessons."
    ),
    ("dc", "literary"): (
        "Official weighting for a devoir de contrôle in literary streams: about 60% of "
        "the marks on recall and comprehension of the most recent lessons, 40% on application."
    ),
    ("ds", "literary"): (
        "Official weighting for a devoir de synthèse in literary streams: about 40% of "
        "the marks on recall and comprehension, 60% on application. It covers the whole "
        "term's lessons."
    ),
    ("dc", "sport"): (
        "Official weighting for a devoir de contrôle in the sport section: about 60% "
        "recall and comprehension, 40% application."
    ),
    ("ds", "sport"): (
        "Official weighting for a devoir de synthèse in the sport section: about 40% "
        "recall and comprehension, 60% application."
    ),
}

_EXAM_TYPE_GUIDANCE: dict[str, str] = {
    "dc": (
        "This is a devoir de contrôle (in-class test, usually 1 hour): focus on the most "
        "recently taught lessons, with clear progressive exercises."
    ),
    "ds": (
        "This is a devoir de synthèse (end-of-term exam, usually 1–2 hours): cover the "
        "whole term, start with accessible questions and finish with a synthesis "
        "exercise that combines several lessons."
    ),
    "dm": (
        "This is a devoir de maison (homework): favour research and fully written "
        "solutions; problems may be longer and more open than in class."
    ),
    "bac_blanc": (
        "This is a mock baccalauréat (bac blanc): reproduce the structure, length and "
        "rigour of the Tunisian national baccalauréat paper for this section — a few "
        "substantial, multi-part exercises with progressive difficulty and a precise "
        "marking scheme out of 20."
    ),
    "concours_6": (
        "This is a preparation paper for the national entrance exam to collèges pilotes "
        "(end of 6th year primary): short, precise questions that discriminate strong "
        "pupils, mixing recall, application and small problem-solving, with a marking "
        "scheme out of 20."
    ),
    "concours_9": (
        "This is a preparation paper for the national entrance exam to lycées pilotes "
        "(end of 9th year): demanding but curriculum-bound questions mixing application "
        "and problem-solving, with a marking scheme out of 20."
    ),
    "partiel": (
        "This is a university midterm (partiel / contrôle continu): cover the chapters "
        "taught so far in the semester, with progressive exercises; favour application "
        "and reasoning over pure recall; keep a clear barème out of the requested total."
    ),
    "final": (
        "This is a university final exam (session principale): cover the whole semester "
        "(or module), start with accessible questions and finish with a synthesis / "
        "problem-solving exercise that combines several chapters; university-level "
        "rigour and precise marking scheme."
    ),
    "rattrapage": (
        "This is a university resit exam (session de rattrapage): same scope as the "
        "final but slightly more guided questions; still graded rigorously with an "
        "explicit barème."
    ),
    "tp_eval": (
        "This is a lab / practical assessment (évaluation de TP): emphasise protocol, "
        "observation, data treatment, interpretation and conclusion; include short "
        "calculation or analysis steps with marks visible."
    ),
    "oral": (
        "This is an oral exam sheet (sujet d'oral): short, well-scoped questions a "
        "student can answer in a few minutes each; include expected answers and "
        "marking notes for the examiner."
    ),
}

_HIGHER_ED_STYLE = (
    "This is higher education (université / faculté / école d'ingénieurs). Use "
    "academic vocabulary appropriate to the year (L1–L3, M1–M2, prépa, ingénieur, "
    "doctorat). Prefer multi-part questions with clear sub-marks. Do not use "
    "primary/secondary school wording such as « devoir de contrôle » unless the "
    "exam type is itself a school devoir."
)

_ARABIC_STYLE = (
    "Write in Modern Standard Arabic as used in Tunisian textbooks and university "
    "course notes. Use standard instruction verbs (أُذكُر، أُعرِّف، أُعلِّل، أُتمِم، "
    "أُنجِز، أَحسُب، أُقارِن، أُحلِّل). Use Western digits (0-9) for numbers and marks."
)

_FRENCH_STYLE = (
    "Use Tunisian academic wording: « Exercice N°1 », questions numbered "
    "1) 2) 3) and sub-questions a) b) c), instruction verbs such as « Définir », "
    "« Justifier », « Calculer », « Compléter », « Analyser »."
)


def prompt_guidance(
    *,
    exam_type: str,
    level: Optional[str],
    section: Optional[str],
    subject: Optional[str],
    trimester: Optional[int],
    duration_minutes: Optional[int],
    language: str,
) -> list[str]:
    """Return prompt lines (in English) describing the Tunisian exam context.

    Returns an empty list when nothing Tunisia-specific was requested, so the
    generic prompt stays byte-for-byte unchanged for existing clients.
    """
    has_context = any(
        [
            exam_type not in (None, "", "generic"),
            level,
            section,
            subject,
            trimester,
            duration_minutes,
        ]
    )
    if not has_context:
        return []

    cycle = cycle_for_level(level)
    lines: list[str] = [
        "",
        "Exam context (Tunisian education system — trusted specification):",
    ]

    if cycle:
        lines.append(f"Education cycle: {label(CYCLE_LABELS, 'en', cycle, cycle)}")

    lines.append(
        f"Exam type: {label(EXAM_TYPE_LABELS, 'en', exam_type or 'generic', 'Exam')}"
    )
    if level:
        lines.append(f"Level: {label(LEVEL_LABELS, 'en', level, level)}")
    if section and (not level or level in SECTIONS_APPLICABLE_LEVELS):
        lines.append(f"Section (stream): {label(SECTION_LABELS, 'en', section, section)}")
    if subject:
        lines.append(f"Subject / module: {subject}")
    if trimester:
        if cycle == "superieur":
            lines.append(f"Semester / term: {trimester}")
        else:
            lines.append(
                f"Term: {label(TRIMESTER_LABELS, 'en', trimester, str(trimester))}"
            )
    if duration_minutes:
        lines.append(f"Duration: {duration_minutes} minutes")

    guidance = _EXAM_TYPE_GUIDANCE.get(exam_type or "")
    if guidance:
        lines.append(guidance)

    if cycle == "superieur":
        lines.append(_HIGHER_ED_STYLE)
    else:
        family = subject_family(subject, section)
        proportions = _PROPORTIONS.get((exam_type or "", family))
        if proportions is None and exam_type in ("dc", "ds") and family == "general":
            proportions = _PROPORTIONS[(exam_type, "scientific")]
        if proportions:
            lines.append(proportions)
        lines.append(
            "Follow Tunisian school conventions: every exercise carries an explicit "
            "barème (marks) and the paper is graded out of the total requested; use "
            "the terminology of the official Tunisian programme for this level; "
            "questions progress from easier to harder within each exercise."
        )

    if language == "ar":
        lines.append(_ARABIC_STYLE)
    elif language == "fr":
        lines.append(_FRENCH_STYLE)
    return lines
