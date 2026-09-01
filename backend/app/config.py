"""
Environment-driven settings for the sales bridge service.

Copy .env.example to .env and fill in real values before this talks to a
real pos4africa account. Until POS4AFRICA_API_KEY is set, the service runs
in stub mode (see app/services/pos4africa_client.py) so the frontend can be
developed and tested end-to-end without real credentials.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # CORS — the Vite dev server and, in production, the deployed dashboard origin.
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # pos4africa.com integration — unset by default (stub mode).
    # TODO(BB): fill these in from pos4africa's API documentation / your account
    # dashboard once available. Nothing here is guessed — see
    # app/services/pos4africa_client.py for exactly what's still a placeholder.
    pos4africa_base_url: str | None = None
    pos4africa_api_key: str | None = None

    @property
    def pos4africa_configured(self) -> bool:
        return bool(self.pos4africa_base_url and self.pos4africa_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
