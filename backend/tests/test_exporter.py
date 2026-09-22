"""Unit tests for the DOCX/PDF exporters — assert they render valid file bytes."""
import io
import zipfile

import pytest
from pypdf import PdfReader

from app.services.exporter import (
    ARABIC_FONT,
    _ensure_arabic_fonts,
    _exercise_heading,
    _paper_from_spec,
    _pdf_text,
    _rtl_lines,
    _student_strip,
    to_docx,
    to_pdf,
)

from .conftest import make_content, make_exercise, make_spec


def _tunisian_spec(**overrides):
    base = dict(
        language="fr",
        exam_type="dc",
        level="sec_2",
        section="sciences_exp",
        subject="Sciences physiques",
        trimester=1,
        duration_minutes=60,
        school_name="Lycée Pilote de Sfax",
        teacher_name="Mme Ben Ali",
        school_year="2026-2027",
    )
    base.update(overrides)
    return make_spec(**base)


def _pdf_text_of(data: bytes) -> str:
    return "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(data)).pages)


def _docx_text_of(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        return z.read("word/document.xml").decode("utf-8")


class TestToDocx:
    def test_returns_docx_zip_bytes(self):
        data = to_docx(make_content())
        # .docx is a ZIP container — starts with the PK magic number.
        assert data[:2] == b"PK"
        assert len(data) > 0

    def test_handles_open_questions_without_choices(self):
        content = make_content(
            exercises=[make_exercise(type="open", choices=None, explanation=None)]
        )
        assert to_docx(content)[:2] == b"PK"


class TestToPdf:
    def test_returns_pdf_bytes(self):
        data = to_pdf(make_content())
        assert data[:4] == b"%PDF"

    def test_handles_missing_title(self):
        content = make_content(title="")
        assert to_pdf(content)[:4] == b"%PDF"

    def test_renders_content_with_markup_characters(self):
        # Angle brackets / ampersands from the LLM must not break rendering.
        content = make_content(
            exercises=[
                make_exercise(
                    question="Is 3 < 5 & 2 > 1?",
                    answer="Yes <b>always</b>",
                    explanation="Because a < b & c",
                    choices=["a < b", "c > d"],
                )
            ]
        )
        assert to_pdf(content)[:4] == b"%PDF"


class TestPaperFromSpec:
    def test_no_spec_is_generic_english_ltr(self):
        paper = _paper_from_spec(None)
        assert paper.lang == "en"
        assert paper.rtl is False
        assert paper.heading is None
        assert paper.has_header is False

    def test_generic_spec_has_no_heading_or_header(self):
        paper = _paper_from_spec(make_spec(language="fr"))
        assert paper.heading is None
        assert paper.has_header is False
        assert paper.t("exercise") == "Exercice N°"

    def test_tunisian_spec_builds_header_and_heading(self):
        paper = _paper_from_spec(_tunisian_spec())
        assert paper.heading == "Devoir de contrôle — 1er trimestre"
        assert ("Établissement", "Lycée Pilote de Sfax") in paper.left_rows
        assert ("Enseignant(e)", "Mme Ben Ali") in paper.left_rows
        assert ("Matière", "Sciences physiques") in paper.right_rows
        assert ("Niveau", "2ème année secondaire — Sciences expérimentales") in paper.right_rows
        assert ("Durée", "60 min") in paper.right_rows

    def test_arabic_spec_is_rtl_with_arabic_labels(self):
        paper = _paper_from_spec(_tunisian_spec(language="ar", exam_type="ds", trimester=2))
        assert paper.rtl is True
        assert paper.heading == "فرض تأليفي — الثلاثي الثاني"
        assert paper.t("answer_key") == "الإصلاح وسلّم التنقيط"


class TestHeadings:
    def test_french_exercise_heading_shows_bareme(self):
        paper = _paper_from_spec(make_spec(language="fr"))
        ex = make_exercise(type="short", choices=None, points=5)
        assert _exercise_heading(paper, 2, ex) == "Exercice N°2 (5 points)"

    def test_mcq_heading_mentions_type(self):
        paper = _paper_from_spec(make_spec(language="fr"))
        assert _exercise_heading(paper, 1, make_exercise(points=4)) == (
            "Exercice N°1 — QCM (4 points)"
        )

    def test_english_heading_keeps_space_before_number(self):
        paper = _paper_from_spec(None)
        ex = make_exercise(type="open", choices=None, points=7)
        assert _exercise_heading(paper, 3, ex) == "Exercise 3 (7 pts)"

    def test_student_strip_shows_total(self):
        paper = _paper_from_spec(make_spec(language="fr"))
        strip = _student_strip(paper, 20)
        assert strip.startswith("Nom & Prénom :")
        assert strip.endswith("/ 20")


class TestRtlLines:
    @pytest.fixture(autouse=True)
    def _fonts(self):
        assert _ensure_arabic_fonts() is True

    def test_short_text_is_single_shaped_line(self):
        lines = _rtl_lines("مرحبا", ARABIC_FONT, 12, 500)
        assert len(lines) == 1
        # Shaping replaces base letters with presentation forms.
        assert lines[0] != "مرحبا"

    def test_long_text_wraps_and_respects_explicit_newlines(self):
        text = " ".join(["الضغط"] * 40) + "\nسطر ثانٍ"
        lines = _rtl_lines(text, ARABIC_FONT, 12, 200)
        assert len(lines) > 2
        assert all(line for line in lines)

    def test_handles_empty(self):
        assert _rtl_lines("", ARABIC_FONT, 12, 200) == [""]


class TestTunisianPdf:
    def test_french_paper_contains_header_heading_and_answer_key(self):
        data = to_pdf(make_content(), _tunisian_spec())
        assert data[:4] == b"%PDF"
        text = _pdf_text_of(data)
        assert "Devoir de contrôle" in text
        assert "Lycée Pilote de Sfax" in text
        assert "Nom & Prénom" in text
        assert "Corrigé et barème" in text
        assert len(PdfReader(io.BytesIO(data)).pages) >= 2  # corrigé on its own page

    def test_arabic_paper_embeds_amiri(self):
        data = to_pdf(make_content(), _tunisian_spec(language="ar"))
        assert data[:4] == b"%PDF"
        assert b"Amiri" in data

    def test_true_false_without_choices_gets_default_labels(self):
        content = make_content(
            exercises=[make_exercise(type="true_false", choices=None, answer="Vrai")]
        )
        text = _pdf_text_of(to_pdf(content, make_spec(language="fr")))
        assert "Vrai" in text and "Faux" in text

    def test_generic_spec_keeps_total_line(self):
        text = _pdf_text_of(to_pdf(make_content(), make_spec(language="fr")))
        assert "Total : 10 points" in text


class TestTunisianDocx:
    def test_french_paper_has_header_table_and_labels(self):
        data = to_docx(make_content(), _tunisian_spec())
        assert data[:2] == b"PK"
        xml = _docx_text_of(data)
        assert "Devoir de contrôle" in xml
        assert "Lycée Pilote de Sfax" in xml
        assert "Corrigé et barème" in xml
        assert "<w:tbl>" in xml

    def test_arabic_paper_is_marked_rtl(self):
        xml = _docx_text_of(to_docx(make_content(), _tunisian_spec(language="ar")))
        assert "<w:bidi/>" in xml
        assert "<w:rtl/>" in xml
        assert "<w:bidiVisual/>" in xml
        assert "فرض مراقبة" in xml


class TestPdfTextEscaping:
    def test_escapes_markup_characters(self):
        assert _pdf_text("a < b & c > d") == "a &lt; b &amp; c &gt; d"

    def test_keeps_linebreaks_only_when_requested(self):
        assert _pdf_text("one\ntwo", keep_linebreaks=True) == "one<br/>two"
        assert _pdf_text("one\ntwo") == "one\ntwo"

    def test_handles_none(self):
        assert _pdf_text(None) == ""
