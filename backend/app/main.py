import logging
import os
from typing import Annotated

from fastapi import Depends, FastAPI, Request, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .auth import CurrentUser, get_current_user
from .config import Settings, get_settings
from .db import get_supabase
from .models.schemas import MeOut
from .rate_limit import limiter
from .routers import admin, billing, documents, exams, usage
from .services import account
from .services import billing as billing_service
from .services import usage as usage_service


def _configure_logging() -> None:
    """Emit the app's logger.* calls at the configured level so platform log
    drains (and any alerting built on them) can see warnings/errors."""
    level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=getattr(logging, level, logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app() -> FastAPI:
    _configure_logging()
    settings = get_settings()
    # Hide OpenAPI UIs on Render / production so the full route surface is not
    # publicly browsable. Local/dev keeps /docs for convenience.
    expose_docs = not (
        os.environ.get("RENDER")
        or os.environ.get("ENVIRONMENT", "").lower() == "production"
    )
    app = FastAPI(
        title="Exam Generator API",
        docs_url="/docs" if expose_docs else None,
        redoc_url="/redoc" if expose_docs else None,
        openapi_url="/openapi.json" if expose_docs else None,
    )

    # Per-client HTTP rate limiting (see app/rate_limit.py). The middleware
    # applies default_limits to every route; hot/expensive routes add stricter
    # per-route limits via the @limiter.limit decorator.
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # Restrict CORS to the exact origins/methods/headers the SPA uses rather
    # than wildcards — a permissive policy combined with credentials is a
    # security risk (SonarQube S5122).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    app.include_router(documents.router)
    app.include_router(exams.router)
    app.include_router(usage.router)
    app.include_router(admin.router)
    app.include_router(billing.router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/me")
    @limiter.limit("30/minute")
    def me(
        request: Request,
        user: Annotated[CurrentUser, Depends(get_current_user)],
        cfg: Annotated[Settings, Depends(get_settings)],
    ) -> MeOut:
        is_admin = usage_service.user_is_admin(user.id, user.email)
        profile = billing_service.get_billing_profile(user.id)
        period_end = profile.get("current_period_end")
        if period_end is not None and not isinstance(period_end, str):
            period_end = str(period_end)
        return MeOut(
            id=user.id,
            email=user.email,
            is_admin=is_admin,
            plan=profile["plan"] if profile["plan"] in ("free", "pro") else "free",
            subscription_status=profile.get("subscription_status"),
            current_period_end=period_end,
        )

    @app.delete("/api/me", status_code=204)
    @limiter.limit("5/minute")
    async def delete_me(
        request: Request,
        user: Annotated[CurrentUser, Depends(get_current_user)],
        cfg: Annotated[Settings, Depends(get_settings)],
    ) -> Response:
        """GDPR/CCPA "delete my data": erase all of the caller's storage objects
        and database rows. The Supabase auth user itself is managed by Supabase
        and is not removed here."""
        sb = get_supabase()
        await run_in_threadpool(account.delete_all_user_data, sb, cfg, user.id)
        return Response(status_code=204)

    return app


app = create_app()
