"""
Admin routes — full CRUD for all platform entities.

Only ADMIN and SUPER_ADMIN roles may access these endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.permissions import require_roles
from app.core.config import settings
from app.db.session import get_db
from app.models.cohort import Cohort, CohortStatus
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.phase import Phase
from app.models.program import Program
from app.models.resource import Resource, ResourceType
from app.models.session import Session as DBSession, SessionStatus, SessionType
from app.models.team import Team, TeamMembership, TeamMemberRole
from app.models.user import AccountStatus, User, UserRole
from app.models.week import Week
from app.schemas.admin_crud import (
    CohortCreate, CohortUpdate,
    FellowUpdate,
    PhaseCreate, PhaseUpdate,
    ProgramCreate, ProgramUpdate,
    ResourceCreate, ResourceUpdate,
    SessionCreate, SessionUpdate,
    TeamCreate, TeamUpdate,
    TeamMemberAdd,
    WeekCreate, WeekUpdate,
)
from app.schemas.auth import (
    CreateFellowRequest,
    CreateFellowResponse,
    CreateStudentResponse,
)
from app.services.auth import DuplicateEmailError, admin_create_fellow
from app.services.invitation import send_invitation_email
from app.services.google_meet import create_meeting_space

router = APIRouter(prefix="/admin", tags=["Admin"])


def _not_found(entity: str, id: object) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{entity} with id={id} not found.")


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


# ===========================================================================
# DASHBOARD STATS
# ===========================================================================

@router.get("/stats", summary="Get platform overview stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    total_fellows = db.scalar(select(func.count(User.id)).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]))) or 0
    active_fellows = db.scalar(select(func.count(User.id)).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]), User.account_status == AccountStatus.ACTIVE)) or 0
    invited_fellows = db.scalar(select(func.count(User.id)).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]), User.account_status == AccountStatus.INVITED)) or 0
    total_cohorts = db.scalar(select(func.count(Cohort.id))) or 0
    total_teams = db.scalar(select(func.count(Team.id))) or 0
    total_sessions = db.scalar(select(func.count(DBSession.id))) or 0
    return {"total_fellows": total_fellows, "active_fellows": active_fellows, "invited_fellows": invited_fellows, "total_cohorts": total_cohorts, "total_teams": total_teams, "total_sessions": total_sessions, "current_phase": "DISCOVER (THINK)", "week": "Week 1 of 4"}


# ===========================================================================
# FELLOWS CRUD
# ===========================================================================

@router.post("/fellows", response_model=CreateFellowResponse, status_code=status.HTTP_201_CREATED, summary="Create a Fellow and send invite")
@router.post("/students", response_model=CreateFellowResponse, status_code=status.HTTP_201_CREATED, deprecated=True, summary="Legacy alias")
def create_fellow(data: CreateFellowRequest, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))) -> CreateFellowResponse:
    try:
        user, raw_token = admin_create_fellow(db, data)
    except DuplicateEmailError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    try:
        send_invitation_email(user=user, raw_token=raw_token)
    except Exception:
        import logging
        logging.getLogger(__name__).exception("Failed to send invitation email to user_id=%s", user.id)
    return CreateStudentResponse.model_validate(user)


@router.get("/fellows", summary="List all Fellows")
def list_fellows(db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    users = db.scalars(select(User).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT])).order_by(User.created_at.desc())).all()
    return [{"id": str(u.id), "first_name": u.first_name, "last_name": u.last_name, "email": u.email, "role": u.role.value, "account_status": u.account_status.value, "two_factor_enabled": u.two_factor_enabled, "created_at": u.created_at.isoformat() if u.created_at else None, "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None} for u in users]


@router.get("/fellows/{fellow_id}", summary="Get a Fellow by ID")
def get_fellow(fellow_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    user = db.scalar(select(User).where(User.id == fellow_id))
    if not user:
        raise _not_found("Fellow", fellow_id)
    return {"id": str(user.id), "first_name": user.first_name, "last_name": user.last_name, "email": user.email, "role": user.role.value, "account_status": user.account_status.value, "two_factor_enabled": user.two_factor_enabled, "created_at": user.created_at.isoformat() if user.created_at else None, "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None}


@router.put("/fellows/{fellow_id}", summary="Update a Fellow")
def update_fellow(fellow_id: str, data: FellowUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    user = db.scalar(select(User).where(User.id == fellow_id))
    if not user:
        raise _not_found("Fellow", fellow_id)
    updates = data.model_dump(exclude_none=True)
    if "account_status" in updates:
        updates["account_status"] = AccountStatus(updates["account_status"])
    if "role" in updates:
        updates["role"] = UserRole(updates["role"])
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {"id": str(user.id), "first_name": user.first_name, "last_name": user.last_name, "email": user.email, "role": user.role.value, "account_status": user.account_status.value}


@router.delete("/fellows/{fellow_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Fellow")
def delete_fellow(fellow_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    user = db.scalar(select(User).where(User.id == fellow_id))
    if not user:
        raise _not_found("Fellow", fellow_id)
    db.delete(user)
    db.commit()


# ===========================================================================
# PROGRAMS CRUD
# ===========================================================================

@router.get("/programs", summary="List all Programs")
def list_programs(db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    programs = db.scalars(select(Program).order_by(Program.created_at.desc())).all()
    return [{"id": str(p.id), "name": p.name, "code": p.code, "description": p.description, "is_active": p.is_active, "created_at": p.created_at.isoformat() if p.created_at else None} for p in programs]


@router.post("/programs", status_code=status.HTTP_201_CREATED, summary="Create a Program")
def create_program(data: ProgramCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if db.scalar(select(Program).where(Program.code == data.code)):
        raise _conflict(f"Program with code '{data.code}' already exists.")
    program = Program(**data.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return {"id": str(program.id), "name": program.name, "code": program.code}


@router.get("/programs/{program_id}", summary="Get a Program by ID")
def get_program(program_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    program = db.scalar(select(Program).where(Program.id == program_id))
    if not program:
        raise _not_found("Program", program_id)
    return {"id": str(program.id), "name": program.name, "code": program.code, "description": program.description, "is_active": program.is_active}


@router.put("/programs/{program_id}", summary="Update a Program")
def update_program(program_id: str, data: ProgramUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    program = db.scalar(select(Program).where(Program.id == program_id))
    if not program:
        raise _not_found("Program", program_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(program, field, value)
    db.commit()
    db.refresh(program)
    return {"id": str(program.id), "name": program.name, "code": program.code, "is_active": program.is_active}


@router.delete("/programs/{program_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Program")
def delete_program(program_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    program = db.scalar(select(Program).where(Program.id == program_id))
    if not program:
        raise _not_found("Program", program_id)
    db.delete(program)
    db.commit()


# ===========================================================================
# PHASES CRUD
# ===========================================================================

@router.get("/phases", summary="List Phases (filter by program_id)")
def list_phases(program_id: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    q = select(Phase).order_by(Phase.sequence)
    if program_id:
        q = q.where(Phase.program_id == program_id)
    phases = db.scalars(q).all()
    return [{"id": str(p.id), "program_id": str(p.program_id), "code": p.code, "name": p.name, "development_role": p.development_role, "sequence": p.sequence, "description": p.description, "duration_weeks": p.duration_weeks, "is_active": p.is_active} for p in phases]


@router.post("/phases", status_code=status.HTTP_201_CREATED, summary="Create a Phase")
def create_phase(data: PhaseCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if not db.scalar(select(Program).where(Program.id == data.program_id)):
        raise _not_found("Program", data.program_id)
    phase = Phase(**data.model_dump())
    db.add(phase)
    db.commit()
    db.refresh(phase)
    return {"id": str(phase.id), "name": phase.name, "code": phase.code}


@router.get("/phases/{phase_id}", summary="Get a Phase by ID")
def get_phase(phase_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    phase = db.scalar(select(Phase).where(Phase.id == phase_id))
    if not phase:
        raise _not_found("Phase", phase_id)
    return {"id": str(phase.id), "program_id": str(phase.program_id), "code": phase.code, "name": phase.name, "development_role": phase.development_role, "sequence": phase.sequence, "description": phase.description, "duration_weeks": phase.duration_weeks, "is_active": phase.is_active}


@router.put("/phases/{phase_id}", summary="Update a Phase")
def update_phase(phase_id: str, data: PhaseUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    phase = db.scalar(select(Phase).where(Phase.id == phase_id))
    if not phase:
        raise _not_found("Phase", phase_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(phase, field, value)
    db.commit()
    db.refresh(phase)
    return {"id": str(phase.id), "name": phase.name, "is_active": phase.is_active}


@router.delete("/phases/{phase_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Phase")
def delete_phase(phase_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    phase = db.scalar(select(Phase).where(Phase.id == phase_id))
    if not phase:
        raise _not_found("Phase", phase_id)
    db.delete(phase)
    db.commit()


# ===========================================================================
# COHORTS CRUD
# ===========================================================================

@router.get("/cohorts", summary="List all Cohorts")
def list_cohorts(db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    cohorts = db.scalars(select(Cohort).order_by(Cohort.created_at.desc())).all()
    res = []
    for c in cohorts:
        count = db.scalar(select(func.count(Enrollment.id)).where(Enrollment.cohort_id == c.id)) or 0
        res.append({"id": str(c.id), "program_id": str(c.program_id), "name": c.name, "code": c.code, "start_date": c.start_date.isoformat() if c.start_date else None, "end_date": c.end_date.isoformat() if c.end_date else None, "status": c.status.value if hasattr(c.status, "value") else str(c.status), "participant_count": count})
    return res


@router.post("/cohorts", status_code=status.HTTP_201_CREATED, summary="Create a Cohort")
def create_cohort(data: CohortCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if db.scalar(select(Cohort).where(Cohort.code == data.code)):
        raise _conflict(f"Cohort with code '{data.code}' already exists.")
    payload = data.model_dump()
    payload["status"] = CohortStatus(payload["status"])
    cohort = Cohort(**payload)
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return {"id": str(cohort.id), "name": cohort.name, "code": cohort.code}


@router.get("/cohorts/{cohort_id}", summary="Get a Cohort by ID")
def get_cohort(cohort_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    cohort = db.scalar(select(Cohort).where(Cohort.id == cohort_id))
    if not cohort:
        raise _not_found("Cohort", cohort_id)
    count = db.scalar(select(func.count(Enrollment.id)).where(Enrollment.cohort_id == cohort.id)) or 0
    return {"id": str(cohort.id), "program_id": str(cohort.program_id), "name": cohort.name, "code": cohort.code, "start_date": cohort.start_date.isoformat() if cohort.start_date else None, "end_date": cohort.end_date.isoformat() if cohort.end_date else None, "status": cohort.status.value if hasattr(cohort.status, "value") else str(cohort.status), "participant_count": count}


@router.put("/cohorts/{cohort_id}", summary="Update a Cohort")
def update_cohort(cohort_id: str, data: CohortUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    cohort = db.scalar(select(Cohort).where(Cohort.id == cohort_id))
    if not cohort:
        raise _not_found("Cohort", cohort_id)
    updates = data.model_dump(exclude_none=True)
    if "status" in updates:
        updates["status"] = CohortStatus(updates["status"])
    for field, value in updates.items():
        setattr(cohort, field, value)
    db.commit()
    db.refresh(cohort)
    return {"id": str(cohort.id), "name": cohort.name, "code": cohort.code}


@router.delete("/cohorts/{cohort_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Cohort")
def delete_cohort(cohort_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    cohort = db.scalar(select(Cohort).where(Cohort.id == cohort_id))
    if not cohort:
        raise _not_found("Cohort", cohort_id)
    db.delete(cohort)
    db.commit()

# ===========================================================================
# COHORT FELLOWS / ENROLLMENTS
# ===========================================================================


@router.get(
    "/cohorts/{cohort_id}/fellows",
    summary="List Fellows enrolled in a Cohort",
)
def list_cohort_fellows(
    cohort_id: UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
):
    cohort = db.scalar(
        select(Cohort).where(Cohort.id == cohort_id)
    )

    if not cohort:
        raise _not_found("Cohort", cohort_id)

    rows = db.execute(
        select(Enrollment, User)
        .join(
            User,
            User.id == Enrollment.user_id,
        )
        .where(
            Enrollment.cohort_id == cohort_id
        )
        .order_by(
            User.first_name,
            User.last_name,
        )
    ).all()

    return [
        {
            "enrollment_id": str(enrollment.id),
            "fellow_id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "account_status": user.account_status.value,
            "enrollment_status": enrollment.enrollment_status.value,
        }
        for enrollment, user in rows
    ]


@router.post(
    "/cohorts/{cohort_id}/fellows/{fellow_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Enroll Fellow into Cohort",
)
def enroll_fellow_in_cohort(
    cohort_id: UUID,
    fellow_id: UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
):
    cohort = db.scalar(
        select(Cohort).where(Cohort.id == cohort_id)
    )

    if not cohort:
        raise _not_found("Cohort", cohort_id)

    fellow = db.scalar(
        select(User).where(
            User.id == fellow_id,
            User.role.in_(
                [
                    UserRole.FELLOW,
                    UserRole.STUDENT,
                ]
            ),
        )
    )

    if not fellow:
        raise _not_found("Fellow", fellow_id)

    # Prevent one Fellow from having two active cohorts.
    other_active_enrollment = db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == fellow_id,
            Enrollment.cohort_id != cohort_id,
            Enrollment.enrollment_status
            == EnrollmentStatus.ACTIVE,
        )
    )

    if other_active_enrollment:
        other_cohort = db.scalar(
            select(Cohort).where(
                Cohort.id
                == other_active_enrollment.cohort_id
            )
        )

        raise _conflict(
            f"Fellow is already actively enrolled in "
            f"'{other_cohort.name if other_cohort else 'another cohort'}'."
        )

    existing = db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == fellow_id,
            Enrollment.cohort_id == cohort_id,
        )
    )

    if existing:
        existing.enrollment_status = (
            EnrollmentStatus.ACTIVE
        )
        existing.completed_at = None

        enrollment = existing

    else:
        enrollment = Enrollment(
            user_id=fellow_id,
            cohort_id=cohort_id,
            enrollment_status=EnrollmentStatus.ACTIVE,
        )

        db.add(enrollment)

    db.commit()
    db.refresh(enrollment)

    return {
        "id": str(enrollment.id),
        "fellow_id": str(fellow.id),
        "cohort_id": str(cohort.id),
        "enrollment_status": enrollment.enrollment_status.value,
    }


@router.delete(
    "/cohorts/{cohort_id}/fellows/{fellow_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove Fellow from Cohort",
)
def remove_fellow_from_cohort(
    cohort_id: UUID,
    fellow_id: UUID,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
):
    enrollment = db.scalar(
        select(Enrollment).where(
            Enrollment.cohort_id == cohort_id,
            Enrollment.user_id == fellow_id,
        )
    )

    if not enrollment:
        raise _not_found(
            "Enrollment",
            f"{cohort_id}/{fellow_id}",
        )

    db.delete(enrollment)
    db.commit()

# ===========================================================================
# WEEKS CRUD
# ===========================================================================

@router.get("/weeks", summary="List Weeks (filter by phase_id)")
def list_weeks(phase_id: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    q = select(Week).order_by(Week.sequence)
    if phase_id:
        q = q.where(Week.phase_id == phase_id)
    weeks = db.scalars(q).all()
    return [{"id": str(w.id), "phase_id": str(w.phase_id), "week_number": w.week_number, "title": w.title, "strategic_question": w.strategic_question, "description": w.description, "sequence": w.sequence, "unlock_at": w.unlock_at.isoformat() if w.unlock_at else None} for w in weeks]


@router.post("/weeks", status_code=status.HTTP_201_CREATED, summary="Create a Week")
def create_week(data: WeekCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if not db.scalar(select(Phase).where(Phase.id == data.phase_id)):
        raise _not_found("Phase", data.phase_id)
    week = Week(**data.model_dump())
    db.add(week)
    db.commit()
    db.refresh(week)
    return {"id": str(week.id), "title": week.title, "week_number": week.week_number}


@router.get("/weeks/{week_id}", summary="Get a Week by ID")
def get_week(week_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    week = db.scalar(select(Week).where(Week.id == week_id))
    if not week:
        raise _not_found("Week", week_id)
    return {"id": str(week.id), "phase_id": str(week.phase_id), "week_number": week.week_number, "title": week.title, "strategic_question": week.strategic_question, "description": week.description, "sequence": week.sequence, "unlock_at": week.unlock_at.isoformat() if week.unlock_at else None}


@router.put("/weeks/{week_id}", summary="Update a Week")
def update_week(week_id: str, data: WeekUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    week = db.scalar(select(Week).where(Week.id == week_id))
    if not week:
        raise _not_found("Week", week_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(week, field, value)
    db.commit()
    db.refresh(week)
    return {"id": str(week.id), "title": week.title, "week_number": week.week_number}


@router.delete("/weeks/{week_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Week")
def delete_week(week_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    week = db.scalar(select(Week).where(Week.id == week_id))
    if not week:
        raise _not_found("Week", week_id)
    db.delete(week)
    db.commit()


# ===========================================================================
# SESSIONS CRUD
# ===========================================================================

@router.get("/sessions", summary="List Sessions (filter by cohort_id or week_id)")
def list_sessions(cohort_id: str | None = None, week_id: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    q = select(DBSession).order_by(DBSession.start_at)
    if cohort_id:
        q = q.where(DBSession.cohort_id == cohort_id)
    if week_id:
        q = q.where(DBSession.week_id == week_id)
    sessions = db.scalars(q).all()
    return [{"id": str(s.id), "cohort_id": str(s.cohort_id), "phase_id": str(s.phase_id), "week_id": str(s.week_id) if s.week_id else None, "session_number": s.session_number, "session_type": s.session_type.value if hasattr(s.session_type, "value") else str(s.session_type), "title": s.title, "description": s.description, "start_at": s.start_at.isoformat() if s.start_at else None, "end_at": s.end_at.isoformat() if s.end_at else None, "meeting_url": s.meeting_url, "meeting_provider": s.meeting_provider,
"google_meet_code": s.google_meet_code,
"google_calendar_event_id": s.google_calendar_event_id,
"google_calendar_event_url": s.google_calendar_event_url,"recording_url": s.recording_url, "status": s.status.value if hasattr(s.status, "value") else str(s.status), "sequence": s.sequence} for s in sessions]


@router.post(
    "/sessions",
    status_code=status.HTTP_201_CREATED,
    summary="Create Session with Google Meet",
)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.SUPER_ADMIN,
        )
    ),
):
    # Date/time must be provided
    if not data.start_at or not data.end_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Start date/time and end date/time are required.",
        )

    if data.end_at <= data.start_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End date/time must be after start date/time.",
        )

    # Google Meet must be enabled
    if not settings.google_meet_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Meet integration is disabled.",
        )

    payload = data.model_dump()

    payload["session_type"] = SessionType(
        payload["session_type"]
    )

    payload["status"] = SessionStatus(
        payload["status"]
    )

    # Admin never enters the Meet URL manually
    payload["meeting_url"] = None

    session = DBSession(**payload)

    db.add(session)

    try:
        db.flush()

        # Create Google Meet automatically
        meet = create_meeting_space()

        session.meeting_provider = "google_meet"

        session.meeting_url = meet["meeting_url"]

        session.google_meet_space_name = meet[
            "space_name"
        ]

        session.google_meet_code = meet[
            "meeting_code"
        ]

        db.commit()
        db.refresh(session)

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Unable to create Google Meet session. "
                f"{str(exc)}"
            ),
        ) from exc

    return {
        "id": str(session.id),
        "title": session.title,
        "session_number": session.session_number,
        "start_at": (
            session.start_at.isoformat()
            if session.start_at
            else None
        ),
        "end_at": (
            session.end_at.isoformat()
            if session.end_at
            else None
        ),
        "meeting_provider": session.meeting_provider,
        "meeting_url": session.meeting_url,
        "google_meet_space_name": session.google_meet_space_name,
        "google_meet_code": session.google_meet_code,
        "status": session.status.value,
    }

@router.get("/sessions/{session_id}", summary="Get a Session by ID")
def get_session(session_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    session = db.scalar(select(DBSession).where(DBSession.id == session_id))
    if not session:
        raise _not_found("Session", session_id)
    return {"id": str(session.id), "cohort_id": str(session.cohort_id), "phase_id": str(session.phase_id), "week_id": str(session.week_id) if session.week_id else None, "session_number": session.session_number, "session_type": session.session_type.value if hasattr(session.session_type, "value") else str(session.session_type), "title": session.title, "description": session.description, "start_at": (
    session.start_at.isoformat()
    if session.start_at
    else None
),
"end_at": (
    session.end_at.isoformat()
    if session.end_at
    else None
), "meeting_url": session.meeting_url, "recording_url": session.recording_url, "status": session.status.value if hasattr(session.status, "value") else str(session.status), "sequence": session.sequence}


@router.put("/sessions/{session_id}", summary="Update a Session")
def update_session(session_id: str, data: SessionUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    session = db.scalar(select(DBSession).where(DBSession.id == session_id))
    if not session:
        raise _not_found("Session", session_id)
    updates = data.model_dump(exclude_none=True)
    if "session_type" in updates:
        updates["session_type"] = SessionType(updates["session_type"])
    if "status" in updates:
        updates["status"] = SessionStatus(updates["status"])
    for field, value in updates.items():
        setattr(session, field, value)
    db.commit()
    db.refresh(session)
    return {"id": str(session.id), "title": session.title, "status": session.status.value}


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Session")
def delete_session(session_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    session = db.scalar(select(DBSession).where(DBSession.id == session_id))
    if not session:
        raise _not_found("Session", session_id)
    db.delete(session)
    db.commit()


# ===========================================================================
# TEAMS CRUD
# ===========================================================================

@router.get("/teams", summary="List Teams (filter by cohort_id)")
def list_teams(cohort_id: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    q = select(Team).order_by(Team.created_at.desc())
    if cohort_id:
        q = q.where(Team.cohort_id == cohort_id)
    teams = db.scalars(q).all()
    res = []
    for t in teams:
        members = db.scalars(select(TeamMembership).where(TeamMembership.team_id == t.id)).all()
        res.append({"id": str(t.id), "cohort_id": str(t.cohort_id), "name": t.name, "company_challenge": t.company_challenge, "company_name": t.company_name, "is_active": t.is_active, "member_count": len(members)})
    return res


@router.post("/teams", status_code=status.HTTP_201_CREATED, summary="Create a Team")
def create_team(data: TeamCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if not db.scalar(select(Cohort).where(Cohort.id == data.cohort_id)):
        raise _not_found("Cohort", data.cohort_id)
    team = Team(**data.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"id": str(team.id), "name": team.name, "cohort_id": str(team.cohort_id)}


@router.get("/teams/{team_id}", summary="Get a Team with members")
def get_team(team_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    team = db.scalar(select(Team).where(Team.id == team_id))
    if not team:
        raise _not_found("Team", team_id)
    memberships = db.scalars(select(TeamMembership).where(TeamMembership.team_id == team.id)).all()
    members = []
    for m in memberships:
        u = db.scalar(select(User).where(User.id == m.user_id))
        members.append({"id": str(m.id), "user_id": str(m.user_id), "team_role": m.team_role.value if hasattr(m.team_role, "value") else str(m.team_role), "joined_at": m.joined_at.isoformat() if m.joined_at else None, "first_name": u.first_name if u else None, "last_name": u.last_name if u else None, "email": u.email if u else None})
    return {"id": str(team.id), "cohort_id": str(team.cohort_id), "name": team.name, "company_challenge": team.company_challenge, "company_name": team.company_name, "is_active": team.is_active, "member_count": len(members), "members": members}


@router.put("/teams/{team_id}", summary="Update a Team")
def update_team(team_id: str, data: TeamUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    team = db.scalar(select(Team).where(Team.id == team_id))
    if not team:
        raise _not_found("Team", team_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(team, field, value)
    db.commit()
    db.refresh(team)
    return {"id": str(team.id), "name": team.name, "is_active": team.is_active}


@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Team")
def delete_team(team_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    team = db.scalar(select(Team).where(Team.id == team_id))
    if not team:
        raise _not_found("Team", team_id)
    db.delete(team)
    db.commit()


@router.post("/teams/{team_id}/members", status_code=status.HTTP_201_CREATED, summary="Add a Fellow to a Team")
def add_team_member(team_id: str, data: TeamMemberAdd, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    team = db.scalar(select(Team).where(Team.id == team_id))
    if not team:
        raise _not_found("Team", team_id)
    if not db.scalar(select(User).where(User.id == data.user_id)):
        raise _not_found("Fellow", data.user_id)
    if db.scalar(select(TeamMembership).where(TeamMembership.team_id == team_id, TeamMembership.user_id == data.user_id)):
        raise _conflict("This Fellow is already a member of this team.")
    membership = TeamMembership(team_id=team.id, cohort_id=team.cohort_id, user_id=data.user_id, team_role=TeamMemberRole(data.team_role))
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return {"id": str(membership.id), "team_id": team_id, "user_id": str(data.user_id), "team_role": membership.team_role.value}


@router.delete("/teams/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Remove a Fellow from a Team")
def remove_team_member(team_id: str, user_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    membership = db.scalar(select(TeamMembership).where(TeamMembership.team_id == team_id, TeamMembership.user_id == user_id))
    if not membership:
        raise _not_found("Team membership", f"team={team_id}/user={user_id}")
    db.delete(membership)
    db.commit()


# ===========================================================================
# RESOURCES CRUD
# ===========================================================================

@router.get("/resources", summary="List Resources (filter by phase_id)")
def list_resources(phase_id: str | None = None, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    q = select(Resource).order_by(Resource.sequence)
    if phase_id:
        q = q.where(Resource.phase_id == phase_id)
    resources = db.scalars(q).all()
    return [{"id": str(r.id), "phase_id": str(r.phase_id), "title": r.title, "subtitle": r.subtitle, "resource_type": r.resource_type.value if hasattr(r.resource_type, "value") else str(r.resource_type), "url": r.url, "is_downloadable": r.is_downloadable, "is_active": r.is_active, "sequence": r.sequence} for r in resources]


@router.post("/resources", status_code=status.HTTP_201_CREATED, summary="Create a Resource")
def create_resource(data: ResourceCreate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    if not db.scalar(select(Phase).where(Phase.id == data.phase_id)):
        raise _not_found("Phase", data.phase_id)
    payload = data.model_dump()
    payload["resource_type"] = ResourceType(payload["resource_type"])
    resource = Resource(**payload)
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"id": str(resource.id), "title": resource.title}


@router.get("/resources/{resource_id}", summary="Get a Resource by ID")
def get_resource(resource_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    resource = db.scalar(select(Resource).where(Resource.id == resource_id))
    if not resource:
        raise _not_found("Resource", resource_id)
    return {"id": str(resource.id), "phase_id": str(resource.phase_id), "title": resource.title, "subtitle": resource.subtitle, "resource_type": resource.resource_type.value if hasattr(resource.resource_type, "value") else str(resource.resource_type), "url": resource.url, "is_downloadable": resource.is_downloadable, "is_active": resource.is_active, "sequence": resource.sequence}


@router.put("/resources/{resource_id}", summary="Update a Resource")
def update_resource(resource_id: str, data: ResourceUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    resource = db.scalar(select(Resource).where(Resource.id == resource_id))
    if not resource:
        raise _not_found("Resource", resource_id)
    updates = data.model_dump(exclude_none=True)
    if "resource_type" in updates:
        updates["resource_type"] = ResourceType(updates["resource_type"])
    for field, value in updates.items():
        setattr(resource, field, value)
    db.commit()
    db.refresh(resource)
    return {"id": str(resource.id), "title": resource.title, "is_active": resource.is_active}


@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Resource")
def delete_resource(resource_id: str, db: Session = Depends(get_db), _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))):
    resource = db.scalar(select(Resource).where(Resource.id == resource_id))
    if not resource:
        raise _not_found("Resource", resource_id)
    db.delete(resource)
    db.commit()
