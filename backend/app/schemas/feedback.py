from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


FeedbackStatus = Literal[
    "revision_required",
    "accepted",
]


class SubmissionFeedbackUpsertRequest(BaseModel):
    feedback_text: str = Field(
        ...,
        min_length=1,
    )

    feedback_url: str | None = Field(
        default=None,
        max_length=1000,
    )

    status: FeedbackStatus


class SubmissionFeedbackDetail(BaseModel):
    id: UUID
    submission_id: UUID

    reviewed_by_user_id: UUID | None = None

    feedback_text: str
    feedback_url: str | None = None

    status: FeedbackStatus

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }