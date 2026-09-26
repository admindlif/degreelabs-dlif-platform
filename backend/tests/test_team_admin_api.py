from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.cohort import Cohort, CohortStatus
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.program import Program
from app.models.team import Team, TeamMembership, TeamMemberRole
from app.models.user import AccountStatus, User, UserRole


def create_program(db: Session) -> Program:
    program = Program(
        name=f"DLIF API Test {uuid4().hex[:6]}",
        code=f"DLIF-API-{uuid4().hex[:8]}",
        is_active=True,
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


def create_cohort(
    db: Session,
    program: Program,
    suffix: str,
) -> Cohort:
    cohort = Cohort(
        program_id=program.id,
        name=f"API Cohort {suffix}",
        code=f"API-{suffix}-{uuid4().hex[:6]}",
        status=CohortStatus.ACTIVE,
    )
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return cohort


def create_fellow(
    db: Session,
    cohort: Cohort,
    prefix: str,
) -> User:
    fellow = User(
        first_name="Test",
        last_name="Fellow",
        email=f"{prefix}_{uuid4().hex[:8]}@degreelabs.com",
        password_hash=hash_password("Pass12345!"),
        role=UserRole.FELLOW,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )
    db.add(fellow)
    db.commit()
    db.refresh(fellow)

    enrollment = Enrollment(
        user_id=fellow.id,
        cohort_id=cohort.id,
        enrollment_status=EnrollmentStatus.ACTIVE,
    )
    db.add(enrollment)
    db.commit()

    return fellow


def create_team(
    db: Session,
    cohort: Cohort,
) -> Team:
    team = Team(
        cohort_id=cohort.id,
        name=f"API-Team-{uuid4().hex[:6]}",
        is_active=True,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


def cleanup(
    db: Session,
    users=None,
    programs=None,
):
    db.rollback()

    for user in users or []:
        existing = db.get(User, user.id)
        if existing:
            db.delete(existing)

    for program in programs or []:
        existing = db.get(Program, program.id)
        if existing:
            db.delete(existing)

    db.commit()


def test_admin_add_fellow_to_team(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    program = create_program(db)
    cohort = create_cohort(db, program, "A")
    fellow = create_fellow(db, cohort, "member")
    team = create_team(db, cohort)

    try:
        response = client.post(
            f"/api/v1/admin/teams/{team.id}/members",
            headers=admin_headers,
            json={
                "user_id": str(fellow.id),
                "team_role": "member",
            },
        )

        assert response.status_code == 201

        data = response.json()

        assert data["team_id"] == str(team.id)
        assert data["user_id"] == str(fellow.id)
        assert data["team_role"] == "member"

    finally:
        cleanup(
            db,
            users=[fellow],
            programs=[program],
        )


def test_admin_cannot_add_fellow_to_team_in_wrong_cohort(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    program = create_program(db)

    cohort_a = create_cohort(db, program, "A")
    cohort_b = create_cohort(db, program, "B")

    fellow = create_fellow(
        db,
        cohort_a,
        "wrong-cohort",
    )

    team = create_team(
        db,
        cohort_b,
    )

    try:
        response = client.post(
            f"/api/v1/admin/teams/{team.id}/members",
            headers=admin_headers,
            json={
                "user_id": str(fellow.id),
                "team_role": "member",
            },
        )

        assert response.status_code == 409
        assert "same Cohort" in response.json()["detail"]

    finally:
        cleanup(
            db,
            users=[fellow],
            programs=[program],
        )


def test_admin_can_change_team_lead(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    program = create_program(db)
    cohort = create_cohort(db, program, "A")

    fellow_a = create_fellow(
        db,
        cohort,
        "lead-a",
    )

    fellow_b = create_fellow(
        db,
        cohort,
        "lead-b",
    )

    team = create_team(
        db,
        cohort,
    )

    try:
        response_a = client.post(
            f"/api/v1/admin/teams/{team.id}/members",
            headers=admin_headers,
            json={
                "user_id": str(fellow_a.id),
                "team_role": "lead",
            },
        )

        assert response_a.status_code == 201

        response_b = client.post(
            f"/api/v1/admin/teams/{team.id}/members",
            headers=admin_headers,
            json={
                "user_id": str(fellow_b.id),
                "team_role": "member",
            },
        )

        assert response_b.status_code == 201

        lead_response = client.put(
            f"/api/v1/admin/teams/{team.id}/lead",
            headers=admin_headers,
            json={
                "user_id": str(fellow_b.id),
            },
        )

        assert lead_response.status_code == 200

        lead_data = lead_response.json()

        assert lead_data["user_id"] == str(fellow_b.id)
        assert lead_data["team_role"] == "lead"

        memberships = (
            db.query(TeamMembership)
            .filter(
                TeamMembership.team_id == team.id
            )
            .all()
        )

        leads = [
            membership
            for membership in memberships
            if membership.team_role == TeamMemberRole.LEAD
        ]

        assert len(leads) == 1
        assert leads[0].user_id == fellow_b.id

    finally:
        cleanup(
            db,
            users=[fellow_a, fellow_b],
            programs=[program],
        )


def test_admin_cannot_remove_current_team_lead(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    program = create_program(db)
    cohort = create_cohort(db, program, "A")
    fellow = create_fellow(db, cohort, "lead")
    team = create_team(db, cohort)

    try:
        add_response = client.post(
            f"/api/v1/admin/teams/{team.id}/members",
            headers=admin_headers,
            json={
                "user_id": str(fellow.id),
                "team_role": "lead",
            },
        )

        assert add_response.status_code == 201

        delete_response = client.delete(
            f"/api/v1/admin/teams/{team.id}/members/{fellow.id}",
            headers=admin_headers,
        )

        assert delete_response.status_code == 409
        assert (
            "Assign another Team Lead"
            in delete_response.json()["detail"]
        )

    finally:
        cleanup(
            db,
            users=[fellow],
            programs=[program],
        )