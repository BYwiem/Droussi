from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    openrouter_api_key: str
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"
    openrouter_referer: str = "http://localhost:5173"
    openrouter_title: str = "Exam Generator"

    allowed_origins: str = "http://localhost:5173"
    documents_bucket: str = "documents"
    exports_bucket: str = "exports"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
