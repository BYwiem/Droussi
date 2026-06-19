from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import CurrentUser, get_current_user
from .config import get_settings
from .routers import chat, documents, exams, usage


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
    app.include_router(chat.router)
    app.include_router(usage.router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/me")
    def me(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        return user

    return app


app = create_app()
