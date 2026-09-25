from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.team import Team, TeamMembership


def get_team_for_fellow(db: Session, user_id: UUID, cohort_id: UUID) -> Team | None:
    """
    Return the Team the Fellow belongs to within the given cohort,
    eagerly loading members and their User records.
    """
    membership = (
        db.query(TeamMembership)
        .options(
            joinedload(TeamMembership.team).joinedload(Team.members).joinedload(TeamMembership.user)
        )
        .filter(
            TeamMembership.user_id == user_id,
            TeamMembership.cohort_id == cohort_id,
        )
        .first()
    )
    return membership.team if membership else None
