from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from google.oauth2 import service_account
from googleapiclient.discovery import build

from app.core.config import settings


CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
]


def _get_calendar_service():
    if not settings.google_service_account_file:
        raise RuntimeError(
            "GOOGLE_SERVICE_ACCOUNT_FILE is not configured."
        )

    if not settings.google_workspace_organizer_email:
        raise RuntimeError(
            "GOOGLE_WORKSPACE_ORGANIZER_EMAIL is not configured."
        )

    credentials = service_account.Credentials.from_service_account_file(
        settings.google_service_account_file,
        scopes=CALENDAR_SCOPES,
    )

    delegated_credentials = credentials.with_subject(
        settings.google_workspace_organizer_email
    )

    return build(
        "calendar",
        "v3",
        credentials=delegated_credentials,
        cache_discovery=False,
    )


def create_calendar_event_with_meet(
    *,
    title: str,
    description: str | None,
    start_at: datetime,
    end_at: datetime,
) -> dict:
    service = _get_calendar_service()

    event_body = {
        "summary": title,
        "description": description or "",
        "start": {
            "dateTime": start_at.isoformat(),
            "timeZone": settings.google_calendar_timezone,
        },
        "end": {
            "dateTime": end_at.isoformat(),
            "timeZone": settings.google_calendar_timezone,
        },
        "conferenceData": {
            "createRequest": {
                "requestId": uuid4().hex,
                "conferenceSolutionKey": {
                    "type": "hangoutsMeet",
                },
            }
        },
    }

    event = (
        service.events()
        .insert(
            calendarId="primary",
            body=event_body,
            conferenceDataVersion=1,
            sendUpdates="none",
        )
        .execute()
    )

    meeting_url = None
    meeting_code = None

    conference_data = event.get("conferenceData") or {}

    for entry_point in conference_data.get("entryPoints", []):
        if entry_point.get("entryPointType") == "video":
            meeting_url = entry_point.get("uri")
            meeting_code = entry_point.get("meetingCode")
            break

    if not meeting_url:
        raise RuntimeError(
            "Google Calendar event created but Meet link was not returned."
        )

    return {
        "event_id": event.get("id"),
        "calendar_url": event.get("htmlLink"),
        "meeting_url": meeting_url,
        "meeting_code": meeting_code,
    }


def update_calendar_event(
    *,
    event_id: str,
    title: str,
    description: str | None,
    start_at: datetime,
    end_at: datetime,
) -> dict:
    service = _get_calendar_service()

    event = (
        service.events()
        .get(
            calendarId="primary",
            eventId=event_id,
        )
        .execute()
    )

    event["summary"] = title
    event["description"] = description or ""

    event["start"] = {
        "dateTime": start_at.isoformat(),
        "timeZone": settings.google_calendar_timezone,
    }

    event["end"] = {
        "dateTime": end_at.isoformat(),
        "timeZone": settings.google_calendar_timezone,
    }

    updated_event = (
        service.events()
        .update(
            calendarId="primary",
            eventId=event_id,
            body=event,
            conferenceDataVersion=1,
            sendUpdates="none",
        )
        .execute()
    )

    meeting_url = None
    meeting_code = None

    conference_data = updated_event.get("conferenceData") or {}

    for entry_point in conference_data.get("entryPoints", []):
        if entry_point.get("entryPointType") == "video":
            meeting_url = entry_point.get("uri")
            meeting_code = entry_point.get("meetingCode")
            break

    return {
        "event_id": updated_event.get("id"),
        "calendar_url": updated_event.get("htmlLink"),
        "meeting_url": meeting_url,
        "meeting_code": meeting_code,
    }


def delete_calendar_event(
    event_id: str,
) -> None:
    service = _get_calendar_service()

    service.events().delete(
        calendarId="primary",
        eventId=event_id,
        sendUpdates="none",
    ).execute()