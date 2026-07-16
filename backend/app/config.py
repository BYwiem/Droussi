from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str
    # Expected JWT audience for Supabase user tokens (GoTrue uses "authenticated").
    supabase_jwt_aud: str = "authenticated"

    openrouter_api_key: str
    # Daily exam quotas by plan. Free is intentionally small so paid conversion
    # funds OpenRouter credits; Pro is the paid tier.
    per_user_exam_limit_free: int = 3
    per_user_exam_limit_pro: int = 50
    # Deprecated alias kept for older env files / admin dashboard display.
    # New code uses the plan-specific limits above.
    per_user_exam_limit: int = 30
    # Account-wide safety cap: stop all generation once total spend for the
    # current UTC day reaches this many USD. Protects the shared credit pool.
    global_daily_cost_limit_usd: float = 5.0
    # Comma-separated emails allowed to view the super-admin dashboard.
    super_admin_emails: str = ""
    openrouter_model: str = "deepseek/deepseek-chat-v3-0324:free"
    openrouter_fallback_models: str = (
        "qwen/qwen3-235b-a22b:free,"
        "mistralai/mistral-small-3.1-24b-instruct:free,"
        "google/gemma-3-27b-it:free,"
        "openrouter/free"
    )
    # Paid-model fallbacks used only by Pro subscribers when free models fail.
    openrouter_paid_fallback_models: str = (
        "deepseek/deepseek-chat,"
        "google/gemini-2.0-flash-001"
    )
    openrouter_request_timeout: int = 60
    openrouter_max_model_attempts: int = 3
    openrouter_referer: str = "http://localhost:5173"
    openrouter_title: str = "Exam Generator"

    # Lemon Squeezy (Merchant of Record). Empty defaults keep local/dev bootable
    # without billing credentials; checkout/portal then return 503.
    lemonsqueezy_api_key: str = ""
    lemonsqueezy_store_id: str = ""
    lemonsqueezy_pro_variant_id: str = ""
    lemonsqueezy_webhook_secret: str = ""
    # Where Lemon Squeezy redirects after checkout (frontend origin).
    billing_success_url: str = "http://localhost:5173/pricing?checkout=success"
    billing_cancel_url: str = "http://localhost:5173/pricing?checkout=cancelled"

    allowed_origins: str = "http://localhost:5173"
    documents_bucket: str = "documents"
    exports_bucket: str = "exports"
    # Reject documents whose downloaded bytes exceed this, before parsing them
    # into memory. Defaults to 15 MiB.
    max_document_bytes: int = 15 * 1024 * 1024

    @property
    def supabase_jwt_issuer(self) -> str:
        """Expected `iss` claim — Supabase GoTrue issues tokens from
        ``{project_url}/auth/v1``."""
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def cors_origins(self) -> list[str]:
        origins: list[str] = []
        for o in self.allowed_origins.split(","):
            origin = o.strip().rstrip("/")
            if origin and origin not in origins:
                origins.append(origin)
        return origins

    @property
    def super_admins(self) -> list[str]:
        return [
            e.strip().lower()
            for e in self.super_admin_emails.split(",")
            if e.strip()
        ]

    @property
    def openrouter_models(self) -> list[str]:
        """Default (free-tier) model chain — free models only."""
        return self.models_for_plan("free")

    @property
    def openrouter_paid_models(self) -> list[str]:
        models: list[str] = []
        for candidate in self.openrouter_paid_fallback_models.split(","):
            model = candidate.strip()
            if model and model not in models:
                models.append(model)
        return models

    def models_for_plan(self, plan: str) -> list[str]:
        """Model attempt chain for a subscription plan.

        Free users stay on `:free` models. Pro users try free models first,
        then fall back to the paid chain so quality stays high when free
        models are rate-limited.
        """
        models: list[str] = []
        free_chain = [self.openrouter_model, *self.openrouter_fallback_models.split(",")]
        for candidate in free_chain:
            model = candidate.strip()
            if model and model not in models:
                models.append(model)
        if (plan or "free").lower() == "pro":
            for model in self.openrouter_paid_models:
                if model not in models:
                    models.append(model)
        return models

    def exam_limit_for_plan(self, plan: str) -> int:
        if (plan or "free").lower() == "pro":
            return max(self.per_user_exam_limit_pro, 0)
        return max(self.per_user_exam_limit_free, 0)


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
