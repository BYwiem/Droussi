import io

from pypdf import PdfReader

from ..config import get_settings


def extract_text(file_bytes: bytes, mime_type: str | None = None) -> str:
    """Extract text from a PDF (or fall back to UTF-8 decode for text files)."""
    if mime_type and mime_type.startswith("text/"):
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return ""
    reader = PdfReader(io.BytesIO(file_bytes))
    max_pages = max(1, get_settings().max_pdf_pages)
    parts: list[str] = []
    for page in reader.pages[:max_pages]:
        try:
            parts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n\n".join(p.strip() for p in parts if p and p.strip())
