import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from ..auth import CurrentUser, get_current_user
from ..config import Settings, get_settings
from ..db import get_supabase
from ..models.schemas import DocumentOut, RegisterDocumentRequest
from ..services.pdf_parser import extract_text
from ..services.storage_paths import InvalidStoragePath, validate_user_storage_path


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Only PDFs and plain-text-family documents are supported by the parser, so
# reject anything else up front rather than trusting the client's mime string
# through to extraction.
_ALLOWED_MIME_PREFIXES = ("text/",)
_ALLOWED_MIME_EXACT = frozenset({"application/pdf"})


def _is_allowed_mime(mime_type: str | None) -> bool:
    if not mime_type:
        # A missing type is treated as a PDF by the parser (its default path).
        return True
    mime = mime_type.split(";", 1)[0].strip().lower()
    return mime in _ALLOWED_MIME_EXACT or mime.startswith(_ALLOWED_MIME_PREFIXES)


def _require_user_storage_path(storage_path: str, user_id: str) -> str:
    try:
        return validate_user_storage_path(storage_path, user_id)
    except InvalidStoragePath as e:
        raise HTTPException(status_code=403, detail=str(e)) from e


@router.post(
    "/register",
    responses={
        403: {"description": "Storage path does not belong to the user"},
        400: {"description": "Could not read the uploaded file"},
        413: {"description": "File exceeds the maximum allowed size"},
        415: {"description": "Unsupported file type"},
        422: {"description": "Could not parse the document"},
        500: {"description": "Database insert failed"},
    },
)
def register_document(
    body: RegisterDocumentRequest,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> DocumentOut:
    sb = get_supabase()

    storage_path = _require_user_storage_path(body.storage_path, user.id)

    if not _is_allowed_mime(body.mime_type):
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Upload a PDF or a text document.",
        )

    if body.size_bytes is not None and body.size_bytes > settings.max_document_bytes:
        raise HTTPException(status_code=413, detail="File is too large.")

    # Pull bytes from storage so we can extract text now.
    try:
        file_bytes = sb.storage.from_(settings.documents_bucket).download(
            storage_path
        )
    except Exception as e:
        logger.warning("Storage download failed for %s: %s", storage_path, e)
        raise HTTPException(
            status_code=400, detail="Could not read the uploaded file."
        ) from e

    # The declared size can lie; enforce the real byte length too.
    if len(file_bytes) > settings.max_document_bytes:
        raise HTTPException(status_code=413, detail="File is too large.")

    try:
        text = extract_text(file_bytes, body.mime_type)
    except Exception as e:
        logger.warning("Document parse failed for %s: %s", storage_path, e)
        raise HTTPException(
            status_code=422, detail="Could not parse the document."
        ) from e

    inserted = (
        sb.table("documents")
        .insert(
            {
                "user_id": user.id,
                "filename": body.filename,
                "storage_path": storage_path,
                "mime_type": body.mime_type,
                "size_bytes": body.size_bytes,
                "extracted_text": text,
            }
        )
        .execute()
    )
    if not inserted.data:
        raise HTTPException(status_code=500, detail="Insert failed")
    return DocumentOut.model_validate(inserted.data[0])


@router.delete(
    "/{doc_id}",
    status_code=204,
    responses={404: {"description": "Document not found"}},
)
def delete_document(
    doc_id: str,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> None:
    sb = get_supabase()
    row = (
        sb.table("documents")
        .select("storage_path")
        .eq("id", doc_id)
        .eq("user_id", user.id)
        .single()
        .execute()
    )
    if not row.data:
        raise HTTPException(status_code=404, detail="Not found")
    # Re-validate before the service-role remove — a poisoned storage_path
    # (written while client UPDATE was still allowed) must not delete another
    # user's object.
    try:
        storage_path = validate_user_storage_path(
            row.data.get("storage_path"), user.id
        )
    except InvalidStoragePath:
        storage_path = None
    if storage_path:
        try:
            sb.storage.from_(settings.documents_bucket).remove([storage_path])
        except Exception:
            pass
    sb.table("documents").delete().eq("id", doc_id).eq("user_id", user.id).execute()
