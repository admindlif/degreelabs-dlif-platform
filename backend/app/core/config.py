from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "DLIF Platform API"
    environment: str = "development"

    # Database
    database_url: str

    # JWT
    secret_key: str = Field(min_length=32)
    access_token_expire_minutes: int = 30

    # Invitation
    invitation_token_expire_hours: int = 72

    # 2FA
    totp_issuer: str = "DegreeLabs DLIF"
    two_fa_challenge_expire_minutes: int = 10

    onboarding_token_expire_minutes: int = 20

    # Frontend
    frontend_base_url: str

    # Email
    email_backend: str = "logging"

    email_from_address: str
    email_from_name: str

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True


    # Google Meet
    google_meet_enabled: bool = False
    google_meet_base_url: str = "https://meet.googleapis.com/v2"

    google_oauth_client_file: str | None = None
    google_oauth_token_file: str | None = None

    # Google Calendar
    google_calendar_enabled: bool = False
    google_calendar_timezone: str = "Asia/Kolkata"

    google_service_account_file: str | None = None
    google_workspace_organizer_email: str | None = None

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