from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DLIF Platform API"
    environment: str = "development"
    database_url: str

    # JWT
    secret_key: str
    access_token_expire_minutes: int = 30

    # Invitation tokens
    invitation_token_expire_hours: int = 72

    # Two-factor authentication
    totp_issuer: str = "DegreeLabs DLIF"
    # Short-lived challenge token issued after password check, before 2FA
    two_fa_challenge_expire_minutes: int = 10

    # Frontend base URL (used in invitation emails)
    frontend_base_url: str = "http://localhost:3000"

    # Email — keep behind abstraction; only used by email service
    email_from_address: str = "noreply@degreelabs.com"
    email_from_name: str = "DegreeLabs"

    model_config = SettingsConfigDict(
        env_file=(
            str(Path(__file__).resolve().parent.parent.parent / ".env"),
            str(Path(__file__).resolve().parent.parent.parent.parent / ".env"),
            ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()