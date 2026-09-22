"""Tests for the Tunisian curriculum rules that shape prompts and papers."""
from app.curriculum import tunisia as cur


class TestSubjectFamily:
    def test_detects_scientific_subjects_in_three_languages(self):
        assert cur.subject_family("Mathématiques") == "scientific"
        assert cur.subject_family("Sciences physiques") == "scientific"
        assert cur.subject_family("SVT") == "scientific"
        assert cur.subject_family("العلوم الفيزيائية") == "scientific"
        assert cur.subject_family("Computer Science") == "scientific"

    def test_detects_literary_subjects(self):
        assert cur.subject_family("Arabe") == "literary"
        assert cur.subject_family("Français") == "literary"
        assert cur.subject_family("التاريخ") == "literary"
        assert cur.subject_family("Éducation islamique") == "literary"

    def test_sport_wins_over_other_keywords(self):
        assert cur.subject_family("Éducation physique et sportive") == "sport"

    def test_falls_back_to_section_then_general(self):
        assert cur.subject_family(None, "sciences_exp") == "scientific"
        assert cur.subject_family("", "lettres") == "literary"
        assert cur.subject_family("", "sport") == "sport"
        assert cur.subject_family(None, None) == "general"


class TestPromptGuidance:
    def _guidance(self, **overrides):
        base = dict(
            exam_type="generic",
            level=None,
            section=None,
            subject=None,
            trimester=None,
            duration_minutes=None,
            language="fr",
        )
        base.update(overrides)
        return cur.prompt_guidance(**base)

    def test_generic_spec_adds_nothing(self):
        assert self._guidance() == []

    def test_dc_scientific_uses_official_40_60_split(self):
        text = "\n".join(self._guidance(exam_type="dc", subject="Mathématiques"))
        assert "devoir de contrôle" in text
        assert "40%" in text and "60%" in text

    def test_ds_scientific_uses_official_20_50_30_split(self):
        text = "\n".join(self._guidance(exam_type="ds", section="sciences_exp"))
        assert "20%" in text and "50%" in text and "30%" in text

    def test_ds_literary_uses_official_40_60_split(self):
        text = "\n".join(self._guidance(exam_type="ds", subject="Arabe"))
        assert "literary" in text
        assert "40%" in text and "60%" in text

    def test_unknown_subject_defaults_to_scientific_grid(self):
        text = "\n".join(self._guidance(exam_type="dc", subject="Matière inconnue"))
        assert "40%" in text

    def test_context_lines_include_level_section_term_duration(self):
        text = "\n".join(
            self._guidance(
                exam_type="bac_blanc",
                level="sec_4",
                section="mathematiques",
                subject="Mathématiques",
                trimester=3,
                duration_minutes=240,
            )
        )
        assert "4th year secondary (bac)" in text
        assert "Section (stream): Mathematics" in text
        assert "Term: 3rd term" in text
        assert "Duration: 240 minutes" in text
        assert "baccalauréat" in text

    def test_arabic_output_gets_arabic_style_rules(self):
        text = "\n".join(self._guidance(exam_type="dc", language="ar"))
        assert "Modern Standard Arabic" in text
        assert "أُعلِّل" in text

    def test_french_output_gets_french_wording_rules(self):
        text = "\n".join(self._guidance(exam_type="dc", language="fr"))
        assert "Exercice N°1" in text


class TestLabels:
    def test_label_falls_back_to_french_then_english(self):
        assert cur.label(cur.EXAM_TYPE_LABELS, "ar", "dc") == "فرض مراقبة"
        assert cur.label(cur.EXAM_TYPE_LABELS, "xx", "dc") == "Devoir de contrôle"
        assert cur.label({"en": {"k": "v"}}, "fr", "k") == "v"
        assert cur.label(cur.EXAM_TYPE_LABELS, "fr", "missing", "dflt") == "dflt"

    def test_every_language_has_every_paper_label(self):
        keys = set(cur.PAPER_LABELS["en"])
        assert set(cur.PAPER_LABELS["fr"]) == keys
        assert set(cur.PAPER_LABELS["ar"]) == keys

    def test_every_language_covers_all_levels_sections_exam_types(self):
        for table in (
            cur.LEVEL_LABELS,
            cur.SECTION_LABELS,
            cur.EXAM_TYPE_LABELS,
            cur.CYCLE_LABELS,
        ):
            assert set(table["fr"]) == set(table["en"]) == set(table["ar"])

    def test_cycle_helpers_cover_school_and_university(self):
        assert cur.cycle_for_level("primaire_3") == "primaire"
        assert cur.cycle_for_level("base_8") == "base"
        assert cur.cycle_for_level("sec_4") == "secondaire"
        assert cur.cycle_for_level("lic_1") == "superieur"
        assert cur.cycle_for_level("ing_2") == "superieur"
        assert cur.cycle_for_level(None) is None
        assert "partiel" in cur.EXAM_TYPES_BY_CYCLE["superieur"]
        assert "dc" in cur.EXAM_TYPES_BY_CYCLE["secondaire"]
        assert "sec_4" in cur.SECTIONS_APPLICABLE_LEVELS

    def test_university_prompt_skips_school_proportions(self):
        text = "\n".join(
            cur.prompt_guidance(
                exam_type="partiel",
                level="mast_1",
                section=None,
                subject="Machine Learning",
                trimester=1,
                duration_minutes=90,
                language="fr",
            )
        )
        assert "Higher education" in text
        assert "40%" not in text
        assert "Master year 1" in text or "M1" in text
        assert "Semester / term" in text
