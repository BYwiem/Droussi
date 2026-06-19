from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    openrouter_api_key: str
    openrouter_token_limit: int = 1_000_000
    openrouter_model: str = "deepseek/deepseek-chat-v3-0324:free"
    openrouter_fallback_models: str = (
        "qwen/qwen3-235b-a22b:free,"
        "mistralai/mistral-small-3.1-24b-instruct:free,"
        "google/gemma-3-27b-it:free,"
        "openrouter/free"
    )
    openrouter_request_timeout: int = 60
    openrouter_max_model_attempts: int = 3
    openrouter_referer: str = "http://localhost:5173"
    openrouter_title: str = "Exam Generator"

    allowed_origins: str = "http://localhost:5173"
    documents_bucket: str = "documents"
    exports_bucket: str = "exports"

    @property
    def cors_origins(self) -> list[str]:
        origins: list[str] = []
        for o in self.allowed_origins.split(","):
            origin = o.strip().rstrip("/")
            if origin and origin not in origins:
                origins.append(origin)
        return origins

    @property
    def openrouter_models(self) -> list[str]:
        models: list[str] = []
        for candidate in [self.openrouter_model, *self.openrouter_fallback_models.split(",")]:
            model = candidate.strip()
            if model and model not in models:
                models.append(model)
        return models


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
