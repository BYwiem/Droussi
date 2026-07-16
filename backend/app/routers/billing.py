"""Billing endpoints backed by Lemon Squeezy."""
import json
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..auth import CurrentUser, get_current_user
from ..config import Settings, get_settings
from ..rate_limit import limiter
from ..services import billing as billing_service
from ..services import usage as usage_service

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.post(
    "/checkout",
    responses={
        503: {"description": "Billing not configured"},
        502: {"description": "Provider error"},
    },
)
@limiter.limit("10/minute")
async def checkout(
    request: Request,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[Literal["url"], str]:
    """Start a Lemon Squeezy hosted checkout for the Pro plan."""
    usage_service.register_user(user.id, user.email)
    url = await billing_service.create_checkout(
        user_id=user.id, email=user.email, settings=settings
    )
    return {"url": url}


@router.post(
    "/portal",
    responses={
        404: {"description": "No billing account"},
        503: {"description": "Billing not configured"},
    },
)
@limiter.limit("10/minute")
async def portal(
    request: Request,
    user: Annotated[CurrentUser, Depends(get_current_user)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[Literal["url"], str]:
    """Open the Lemon Squeezy customer portal (manage / cancel subscription)."""
    url = await billing_service.get_customer_portal_url(
        user_id=user.id, settings=settings
    )
    return {"url": url}


@router.post("/webhook", include_in_schema=False)
@limiter.limit("120/minute")
async def webhook(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, str]:
    """Receive Lemon Squeezy subscription events. Signature-verified; no JWT."""
    raw = await request.body()
    signature = request.headers.get("X-Signature", "")
    if not billing_service.verify_webhook_signature(
        raw, signature, settings.lemonsqueezy_webhook_secret
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature.",
        )
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as e:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.") from e

    event_name = (payload.get("meta") or {}).get("event_name") or ""
    if event_name.startswith("subscription_"):
        billing_service.apply_subscription_webhook(event_name, payload)
    return {"status": "ok"}
