from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.session import Session as DBSession, SessionStatus
from app.models.user import User
from app.repositories.discover import (
    get_next_session_for_cohort,
    get_phase_by_code,
    get_session_by_id_for_cohort,
    get_sessions_for_cohort,
    get_weeks_for_phase,
)
from app.repositories.enrollment import get_active_enrollment_for_user
from app.schemas.discover import (
    DiscoverOverviewResponse,
    DiscoverProgress,
    DiscoverWeekResponse,
    SessionDetailResponse,
    SessionSummary,
)
from app.schemas.fellow_context import CohortSummary, PhaseSummary


def _to_session_summary(s) -> SessionSummary:
    return SessionSummary(
        id=s.id,
        session_number=s.session_number,
        session_type=s.session_type.value if hasattr(s.session_type, "value") else str(s.session_type),
        title=s.title,
        description=s.description,
        start_at=s.start_at,
        end_at=s.end_at,
        meeting_url=s.meeting_url,
        recording_url=s.recording_url,
        status=s.status.value if hasattr(s.status, "value") else str(s.status),
        sequence=s.sequence,
        has_recording=bool(s.recording_url),
    )

def get_fellow_sessions(
    db: Session,
    current_user: User,
) -> list[SessionSummary]:
    """
    Return every session assigned to the Fellow's active cohort.
    """

    enrollment = get_active_enrollment_for_user(
        db,
        current_user.id,
    )

    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active cohort enrollment found for current Fellow.",
        )

    sessions = db.scalars(
        select(DBSession)
        .where(
            DBSession.cohort_id
            == enrollment.cohort_id
        )
        .order_by(
            DBSession.sequence.asc(),
            DBSession.start_at.asc(),
        )
    ).all()

    return [
        _to_session_summary(session)
        for session in sessions
    ]

def get_discover_overview(db: Session, current_user: User) -> DiscoverOverviewResponse:
    enrollment = get_active_enrollment_for_user(db, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active cohort enrollment found for current Fellow.",
        )

    cohort = enrollment.cohort
    phase = get_phase_by_code(db, cohort.program_id, code="DISCOVER")
    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active DISCOVER phase not found.",
        )

    sessions = get_sessions_for_cohort(db, cohort.id, phase.id)
    total_sessions = len(sessions)
    completed_sessions = sum(1 for s in sessions if s.status == SessionStatus.COMPLETED)
    percentage = round((completed_sessions / total_sessions) * 100) if total_sessions > 0 else 0

    next_session_db = get_next_session_for_cohort(db, cohort.id, phase.id)
    next_session_summary = _to_session_summary(next_session_db) if next_session_db else None

    # Derive current week based on next session's week or default to 1
    current_week = 1
    if next_session_db and next_session_db.week:
        current_week = next_session_db.week.week_number
    elif completed_sessions == total_sessions and total_sessions > 0:
        current_week = phase.duration_weeks

    progress = DiscoverProgress(
        current_week=current_week,
        total_weeks=phase.duration_weeks,
        percentage=percentage,
        completed_sessions=completed_sessions,
        total_sessions=total_sessions,
    )

    return DiscoverOverviewResponse(
        phase=PhaseSummary(
            id=phase.id,
            code=phase.code,
            name=phase.name,
            development_role=phase.development_role,
            sequence=phase.sequence,
        ),
        cohort=CohortSummary(
            id=cohort.id,
            name=cohort.name,
            code=cohort.code,
            status=cohort.status.value if hasattr(cohort.status, "value") else str(cohort.status),
        ),
        progress=progress,
        next_session=next_session_summary,
    )


def get_discover_weeks(db: Session, current_user: User) -> list[DiscoverWeekResponse]:
    enrollment = get_active_enrollment_for_user(db, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active cohort enrollment found for current Fellow.",
        )

    cohort = enrollment.cohort
    phase = get_phase_by_code(db, cohort.program_id, code="DISCOVER")
    if not phase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active DISCOVER phase not found.",
        )

    weeks = get_weeks_for_phase(db, phase.id)
    sessions = get_sessions_for_cohort(db, cohort.id, phase.id)

    # Map sessions to weeks. If week_id is None (e.g. Session 0), attach it to Week 1
    week_sessions_map: dict[UUID, list] = {w.id: [] for w in weeks}
    unassigned_sessions = []

    for s in sessions:
        if s.week_id and s.week_id in week_sessions_map:
            week_sessions_map[s.week_id].append(s)
        else:
            unassigned_sessions.append(s)

    # Attach unassigned (induction Session 0) to Week 1 if available
    if weeks and unassigned_sessions:
        first_week_id = weeks[0].id
        week_sessions_map[first_week_id] = sorted(
            unassigned_sessions + week_sessions_map[first_week_id],
            key=lambda x: x.sequence,
        )

    # Find the current active week
    next_session_db = get_next_session_for_cohort(db, cohort.id, phase.id)
    active_week_number = 1
    if next_session_db and next_session_db.week:
        active_week_number = next_session_db.week.week_number

    results = []
    for w in weeks:
        w_sessions = [_to_session_summary(s) for s in week_sessions_map.get(w.id, [])]
        
        # Determine status
        if w.week_number < active_week_number:
            week_status = "completed"
            status_badge = "Completed"
        elif w.week_number == active_week_number:
            week_status = "active"
            status_badge = "Current Week • In Progress"
        elif w.week_number == active_week_number + 1:
            week_status = "upcoming"
            status_badge = "Upcoming"
        else:
            week_status = "locked"
            status_badge = "Locked"

        results.append(
            DiscoverWeekResponse(
                id=w.id,
                week_number=w.week_number,
                title=w.title,
                strategic_question=w.strategic_question,
                description=w.description,
                sequence=w.sequence,
                status=week_status,
                status_badge=status_badge,
                sessions=w_sessions,
            )
        )

    return results


def get_session_detail(db: Session, current_user: User, session_id: UUID) -> SessionDetailResponse:
    enrollment = get_active_enrollment_for_user(db, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active cohort enrollment found for current Fellow.",
        )

    session = get_session_by_id_for_cohort(db, session_id, enrollment.cohort_id)
    if not session:
        # Check if the session exists in database at all (for another cohort)
        from app.models.session import Session as DBSession
        any_session = db.get(DBSession, session_id)
        if any_session:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Session belongs to another cohort.",
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )

    return SessionDetailResponse(
        id=session.id,
        cohort_id=session.cohort_id,
        phase_id=session.phase_id,
        week_id=session.week_id,
        session_number=session.session_number,
        session_type=session.session_type.value if hasattr(session.session_type, "value") else str(session.session_type),
        title=session.title,
        description=session.description,
        start_at=session.start_at,
        end_at=session.end_at,
        meeting_url=session.meeting_url,
        recording_url=session.recording_url,
        status=session.status.value if hasattr(session.status, "value") else str(session.status),
        sequence=session.sequence,
        has_recording=bool(session.recording_url),
        week_title=session.week.title if session.week else None,
        week_number=session.week.week_number if session.week else None,
    )
