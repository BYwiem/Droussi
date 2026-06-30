from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import CurrentUser, get_current_user
from .config import Settings, get_settings
from .models.schemas import MeOut
from .routers import admin, documents, exams, usage
from .routers.admin import is_super_admin


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Exam Generator API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(documents.router)
    app.include_router(exams.router)
    app.include_router(usage.router)
    app.include_router(admin.router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/me", response_model=MeOut)
    def me(
        user: CurrentUser = Depends(get_current_user),
        cfg: Settings = Depends(get_settings),
    ) -> MeOut:
        return MeOut(
            id=user.id,
            email=user.email,
            is_admin=is_super_admin(user.email, cfg),
        )

    return app


app = create_app()
