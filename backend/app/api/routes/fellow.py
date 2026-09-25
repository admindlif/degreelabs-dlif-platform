from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_fellow_portal
from app.db.session import get_db
from app.models.user import User
from app.schemas.discover import (
    DiscoverOverviewResponse,
    DiscoverWeekResponse,
    SessionDetailResponse,
)
from app.schemas.fellow_context import FellowContextResponse
from app.schemas.team_resource import ResourceResponse, TeamResponse
from app.services.discover import (
    get_discover_overview,
    get_discover_weeks,
    get_session_detail,
)
from app.services.fellow_context import get_fellow_context
from app.services.resource import get_fellow_resources
from app.services.team import get_fellow_team

router = APIRouter(prefix="/fellow", tags=["Fellow Portal"])


@router.get(
    "/context",
    response_model=FellowContextResponse,
    summary="Get Fellow context (program, cohort, active phase)",
)
def get_context(
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> FellowContextResponse:
    return get_fellow_context(db, current_user)


@router.get(
    "/discover/overview",
    response_model=DiscoverOverviewResponse,
    summary="Get DISCOVER phase overview for authenticated Fellow",
)
def get_overview(
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> DiscoverOverviewResponse:
    return get_discover_overview(db, current_user)


@router.get(
    "/discover/weeks",
    response_model=list[DiscoverWeekResponse],
    summary="Get all DISCOVER weeks and sessions for authenticated Fellow",
)
def get_weeks(
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> list[DiscoverWeekResponse]:
    return get_discover_weeks(db, current_user)


@router.get(
    "/discover/weeks/{week_id}",
    response_model=DiscoverWeekResponse,
    summary="Get specific DISCOVER week details and sessions",
)
def get_week_by_id(
    week_id: UUID,
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> DiscoverWeekResponse:
    weeks = get_discover_weeks(db, current_user)
    for w in weeks:
        if w.id == week_id:
            return w
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Week not found in active phase.",
    )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get session details by ID for authenticated Fellow",
)
def get_session(
    session_id: UUID,
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> SessionDetailResponse:
    return get_session_detail(db, current_user, session_id)


@router.get(
    "/team",
    response_model=TeamResponse,
    summary="Get the authenticated Fellow's team and members",
)
def get_team(
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> TeamResponse:
    return get_fellow_team(db, current_user)


@router.get(
    "/resources",
    response_model=list[ResourceResponse],
    summary="Get curriculum resources for the Fellow's current phase",
)
def get_resources(
    current_user: User = Depends(require_fellow_portal),
    db: Session = Depends(get_db),
) -> list[ResourceResponse]:
    return get_fellow_resources(db, current_user)

