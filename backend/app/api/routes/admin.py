"""
Admin routes.

Only ADMIN and SUPER_ADMIN roles may access these endpoints.

POST /api/v1/admin/students   — create a student and send invitation
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.permissions import require_roles
from app.db.session import get_db
from app.models.cohort import Cohort
from app.models.enrollment import Enrollment
from app.models.session import Session as DBSession
from app.models.team import Team, TeamMembership
from app.models.user import AccountStatus, User, UserRole
from app.schemas.auth import (
    CreateFellowRequest,
    CreateFellowResponse,
    CreateStudentRequest,
    CreateStudentResponse,
)
from app.services.auth import DuplicateEmailError, admin_create_fellow, admin_create_student
from app.services.invitation import send_invitation_email


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.post(
    "/fellows",
    response_model=CreateFellowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Fellow and send invitation email",
)
@router.post(
    "/students",
    response_model=CreateFellowResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Fellow (legacy alias) and send invitation email",
    deprecated=True,
)
def create_fellow(
    data: CreateFellowRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    ),
) -> CreateFellowResponse:
    """
    Admin-only endpoint to create a new Fellow account.

    The Fellow is created with:
    - role = fellow
    - account_status = invited
    - password_hash = NULL
    - two_factor_enabled = false

    A secure invitation email is sent to the Fellow's address.
    The plain-text token is never stored or returned in this response.
    """
    try:
        user, raw_token = admin_create_fellow(db, data)
    except DuplicateEmailError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    # Send invitation email after the transaction is committed.
    # Any email failure is intentionally not rolled back — the user
    # record exists and an admin can re-trigger the invitation.
    try:
        send_invitation_email(user=user, raw_token=raw_token)
    except Exception:  # noqa: BLE001
        # Log but don't fail the request — the admin UI can show a
        # "resend invitation" option if email delivery fails.
        import logging
        logging.getLogger(__name__).exception(
            "Failed to send invitation email to user_id=%s", user.id
        )

    return CreateStudentResponse.model_validate(user)


@router.get(
    "/fellows",
    summary="List all Fellows in the platform",
)
def list_fellows(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Return all fellows with account status and 2FA status."""
    users = db.scalars(
        select(User)
        .where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]))
        .order_by(User.created_at.desc())
    ).all()
    return [
        {
            "id": str(u.id),
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role.value,
            "account_status": u.account_status.value,
            "two_factor_enabled": u.two_factor_enabled,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        }
        for u in users
    ]


@router.get(
    "/stats",
    summary="Get platform overview stats for admin dashboard",
)
def get_admin_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Aggregate platform KPIs and metrics."""
    total_fellows = db.scalar(
        select(func.count(User.id)).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]))
    ) or 0
    active_fellows = db.scalar(
        select(func.count(User.id)).where(
            User.role.in_([UserRole.FELLOW, UserRole.STUDENT]),
            User.account_status == AccountStatus.ACTIVE,
        )
    ) or 0
    invited_fellows = db.scalar(
        select(func.count(User.id)).where(
            User.role.in_([UserRole.FELLOW, UserRole.STUDENT]),
            User.account_status == AccountStatus.INVITED,
        )
    ) or 0
    total_cohorts = db.scalar(select(func.count(Cohort.id))) or 0
    total_teams = db.scalar(select(func.count(Team.id))) or 0
    total_sessions = db.scalar(select(func.count(DBSession.id))) or 0

    return {
        "total_fellows": total_fellows,
        "active_fellows": active_fellows,
        "invited_fellows": invited_fellows,
        "total_cohorts": total_cohorts,
        "total_teams": total_teams,
        "total_sessions": total_sessions,
        "current_phase": "DISCOVER (THINK)",
        "week": "Week 1 of 4",
    }


@router.get(
    "/cohorts",
    summary="List all cohorts",
)
def list_cohorts(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Return cohorts with enrollment counts."""
    cohorts = db.scalars(select(Cohort).order_by(Cohort.created_at.desc())).all()
    res = []
    for c in cohorts:
        count = db.scalar(select(func.count(Enrollment.id)).where(Enrollment.cohort_id == c.id)) or 0
        res.append({
            "id": str(c.id),
            "name": c.name,
            "code": c.code,
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "status": "In Progress" if c.is_active else "Completed",
            "participant_count": count,
        })
    return res


@router.get(
    "/teams",
    summary="List all Fellow teams",
)
def list_teams(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
):
    """Return teams with member counts."""
    teams = db.scalars(select(Team).order_by(Team.created_at.desc())).all()
    res = []
    for t in teams:
        members = db.scalars(select(TeamMembership).where(TeamMembership.team_id == t.id)).all()
        res.append({
            "id": str(t.id),
            "name": t.name,
            "company_challenge": t.company_challenge or "SK Innovation AI Diagnostics",
            "member_count": len(members),
        })
    return res

