from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TeamSubmissionUpsertRequest(BaseModel):
    drive_url: str = Field(
        ...,
        min_length=1,
        max_length=1000,
    )


class TeamSubmissionDetail(BaseModel):
    id: UUID
    session_id: UUID
    team_id: UUID
    submitted_by_user_id: UUID | None

    drive_url: str

    submitted_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class SessionSubmissionResponse(BaseModel):
    submission: TeamSubmissionDetail | None = None

    can_submit: bool
    is_team_lead: bool

class AdminSessionSubmissionItem(BaseModel):
    team_id: UUID
    team_name: str

    team_lead_user_id: UUID | None = None
    team_lead_name: str | None = None

    submission: TeamSubmissionDetail | None = None