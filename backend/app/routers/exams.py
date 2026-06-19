import asyncio
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from ..auth import CurrentUser, get_current_user
from ..config import Settings, get_settings
from ..db import get_supabase
from ..models.schemas import (
    ExamOut,
    GenerateExamRequest,
)
from ..services import exam_generator, exporter
from ..services import usage as usage_service


router = APIRouter(prefix="/api/exams", tags=["exams"])


@router.post("/draft", response_model=ExamOut)
def create_draft(
    document_id: str = Query(...),
    user: CurrentUser = Depends(get_current_user),
) -> ExamOut:
    """Create an empty draft exam so a per-exam chat can be attached before
    generation. Lets the user chat first, then submit the form."""
    sb = get_supabase()
    doc = (
        sb.table("documents")
        .select("id")
        .eq("id", document_id)
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )
    if not doc or not doc.data:
        raise HTTPException(status_code=404, detail="Document not found")

    existing = (
        sb.table("exams")
        .select("*")
        .eq("user_id", user.id)
        .eq("document_id", document_id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if existing.data:
        return ExamOut.model_validate(existing.data[0])

    inserted = (
        sb.table("exams")
        .insert(
            {
                "user_id": user.id,
                "document_id": document_id,
                "spec": {},
                "status": "pending",
            }
        )
        .execute()
    )
    if not inserted.data:
        raise HTTPException(status_code=500, detail="Could not create draft")
    return ExamOut.model_validate(inserted.data[0])


@router.post("/{exam_id}/generate", response_model=ExamOut)
async def generate(
    exam_id: str,
    body: GenerateExamRequest,
    user: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> ExamOut:
    sb = get_supabase()

    doc = (
        sb.table("documents")
        .select("id, extracted_text")
        .eq("id", body.document_id)
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )
    if not doc or not doc.data:
        raise HTTPException(status_code=404, detail="Document not found")

    course_text = doc.data.get("extracted_text") or ""
    if not course_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Document has no extracted text — cannot generate exam.",
        )

    # Pull per-exam chat history for context.
    chat_rows = (
        sb.table("chat_messages")
        .select("role, content")
        .eq("user_id", user.id)
        .eq("scope", "exam")
        .eq("scope_id", exam_id)
        .order("created_at")
        .execute()
    )
    chat_history = [
        {"role": r["role"], "content": r["content"]} for r in (chat_rows.data or [])
    ]

    sb.table("exams").update(
        {"spec": body.spec.model_dump(), "status": "generating"}
    ).eq("id", exam_id).eq("user_id", user.id).execute()

    usage_service.ensure_within_limit(user.id)

    try:
        content = await asyncio.wait_for(
            exam_generator.generate_exam(
                user_id=user.id,
                spec=body.spec,
                course_text=course_text,
                chat_history=chat_history,
            ),
            timeout=180,
        )
    except TimeoutError as e:
        sb.table("exams").update({"status": "error"}).eq("id", exam_id).execute()
        raise HTTPException(
            status_code=504,
            detail=(
                "Exam generation timed out after 3 minutes. "
                "Try again with fewer exercises or a shorter document."
            ),
        ) from e
    except Exception as e:
        sb.table("exams").update({"status": "error"}).eq("id", exam_id).execute()
        raise HTTPException(status_code=502, detail=f"Generation failed: {e}") from e

    # Render export and upload.
    if body.spec.export_format == "docx":
        export_bytes = exporter.to_docx(content)
        ext = "docx"
        content_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    else:
        export_bytes = exporter.to_pdf(content)
        ext = "pdf"
        content_type = "application/pdf"

    export_path = f"{user.id}/{exam_id}-{uuid.uuid4().hex}.{ext}"
    try:
        sb.storage.from_(settings.exports_bucket).upload(
            export_path,
            export_bytes,
            {"content-type": content_type, "x-upsert": "true"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export upload failed: {e}") from e

    updated = (
        sb.table("exams")
        .update(
            {
                "title": content.title,
                "content": content.model_dump(),
                "export_format": body.spec.export_format,
                "export_path": export_path,
                "status": "ready",
            }
        )
        .eq("id", exam_id)
        .eq("user_id", user.id)
        .execute()
    )
    if not updated.data:
        raise HTTPException(status_code=500, detail="Update failed")
    return ExamOut.model_validate(updated.data[0])


@router.get("/{exam_id}/download")
def download_url(
    exam_id: str,
    user: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> dict[Literal["url"], str]:
    sb = get_supabase()
    row = (
        sb.table("exams")
        .select("export_path")
        .eq("id", exam_id)
        .eq("user_id", user.id)
        .maybe_single()
        .execute()
    )
    if not row.data or not row.data.get("export_path"):
        raise HTTPException(status_code=404, detail="Export not ready")
    signed = sb.storage.from_(settings.exports_bucket).create_signed_url(
        row.data["export_path"], 3600
    )
    url = signed.get("signedURL") or signed.get("signed_url")
    if not url:
        raise HTTPException(status_code=500, detail="Could not sign URL")
    return {"url": url}
