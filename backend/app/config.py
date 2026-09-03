"""
Environment-driven settings for the sales bridge service.

Copy .env.example to .env and fill in real values before this talks to a
real pos4africa account. Until POS4AFRICA_BASE_URL / _USERNAME / _PASSWORD
are all set, the service runs in stub mode (see
app/services/pos4africa_client.py) so the frontend can be developed and
tested end-to-end without real credentials.
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

    # pos4africa.com is a legacy server-rendered PHP app (PHP Point of Sale,
    # white-labelled), not a REST/JSON API — see app/services/pos4africa_client.py
    # for what this means for the integration. Auth is a session cookie from a
    # login form, not an API key, hence username/password rather than a token.
    pos4africa_base_url: str | None = None  # e.g. https://fahadtahir.pos4africa.com
    pos4africa_username: str | None = None
    pos4africa_password: str | None = None

    @property
    def pos4africa_configured(self) -> bool:
        return bool(self.pos4africa_base_url and self.pos4africa_username and self.pos4africa_password)


@lru_cache
def get_settings() -> Settings:
    return Settings()
