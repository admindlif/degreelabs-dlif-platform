"""
Email service abstraction.

The delivery backend is swappable without changing the calling code.
In development mode, emails are printed to stdout so developers can
immediately see the activation URL without needing a mail server.

Production adapters (AWS SES, Postmark, Resend) can be added by
implementing the ``EmailBackend`` protocol and switching via
``EMAIL_BACKEND`` environment variable.
"""

import logging
from typing import Protocol

from app.core.config import settings


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Backend protocol
# ---------------------------------------------------------------------------


class EmailBackend(Protocol):
    def send(
        self,
        *,
        to_address: str,
        subject: str,
        html_body: str,
        text_body: str,
    ) -> None: ...


# ---------------------------------------------------------------------------
# Development backend — logs to stdout
# ---------------------------------------------------------------------------


class LoggingEmailBackend:
    """
    Development-only backend.

    Prints the full email to stdout rather than sending it.
    The activation URL is printed clearly so developers can copy it
    directly without requiring a real mail provider.
    """

    def send(
        self,
        *,
        to_address: str,
        subject: str,
        html_body: str,
        text_body: str,
    ) -> None:
        separator = "=" * 72
        logger.info(
            "\n%s\n[DEV EMAIL]\nTo: %s\nSubject: %s\n\n%s\n%s",
            separator,
            to_address,
            subject,
            text_body,
            separator,
        )


# ---------------------------------------------------------------------------
# Backend factory
# ---------------------------------------------------------------------------


def _get_backend() -> EmailBackend:
    """
    Return the email backend appropriate for the current environment.

    Extend this to support AWS SES, Postmark, or Resend by checking
    ``settings.email_backend`` and returning the relevant adapter.
    """
    if settings.environment == "development":
        return LoggingEmailBackend()

    # Production / staging: raise until a real backend is wired in.
    raise NotImplementedError(
        f"No email backend configured for environment={settings.environment!r}. "
        "Implement an adapter in services/email.py."
    )


# ---------------------------------------------------------------------------
# Public helper
# ---------------------------------------------------------------------------


def send_email(
    *,
    to_address: str,
    subject: str,
    html_body: str,
    text_body: str,
) -> None:
    """
    Send an email via the configured backend.

    This is the only function callers outside this module should use.
    """
    backend = _get_backend()
    backend.send(
        to_address=to_address,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )
