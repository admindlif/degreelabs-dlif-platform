from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.fellow_context import CohortSummary, PhaseSummary


class SessionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_number: int
    session_type: str
    title: str
    description: str | None = None
    start_at: datetime
    end_at: datetime
    meeting_url: str | None = None
    recording_url: str | None = None
    status: str
    sequence: int
    has_recording: bool = False


class DiscoverProgress(BaseModel):
    current_week: int
    total_weeks: int
    percentage: int
    completed_sessions: int
    total_sessions: int


class DiscoverOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    phase: PhaseSummary
    cohort: CohortSummary
    progress: DiscoverProgress
    next_session: SessionSummary | None = None


class DiscoverWeekResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    week_number: int
    title: str
    strategic_question: str | None = None
    description: str | None = None
    sequence: int
    status: str  # active | upcoming | locked | completed
    status_badge: str
    sessions: list[SessionSummary]


class SessionDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    cohort_id: UUID
    phase_id: UUID
    week_id: UUID | None = None
    session_number: int
    session_type: str
    title: str
    description: str | None = None
    start_at: datetime
    end_at: datetime
    meeting_url: str | None = None
    recording_url: str | None = None
    status: str
    sequence: int
    has_recording: bool = False
    week_title: str | None = None
    week_number: int | None = None
