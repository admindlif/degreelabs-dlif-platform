from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.enrollment import get_active_enrollment_for_user
from app.repositories.team import get_team_for_fellow
from app.schemas.team_resource import TeamMemberResponse, TeamResponse


def get_fellow_team(db: Session, current_user: User) -> TeamResponse:
    """
    Return the Team for the authenticated Fellow in their active cohort.
    Raises 404 if the Fellow has no team assignment yet.
    """
    enrollment = get_active_enrollment_for_user(db, current_user.id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found for this Fellow.",
        )

    team = get_team_for_fellow(db, current_user.id, enrollment.cohort_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No team assignment found for this Fellow in the current cohort.",
        )

    members: list[TeamMemberResponse] = []
    for membership in team.members:
        u = membership.user
        initials = (
            (u.first_name[0] if u.first_name else "") +
            (u.last_name[0] if u.last_name else "")
        ).upper()
        members.append(
            TeamMemberResponse(
                id=str(u.id),
                first_name=u.first_name or "",
                last_name=u.last_name or "",
                initials=initials,
                team_role=membership.team_role.value,
            )
        )

    return TeamResponse(
        id=str(team.id),
        name=team.name,
        company_challenge=team.company_challenge,
        company_name=team.company_name,
        member_count=len(members),
        members=members,
    )
