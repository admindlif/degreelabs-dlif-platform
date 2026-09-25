"""
Seed script for DLIF DISCOVER curriculum and active cohort.

Idempotent: safe to run multiple times without duplicating data.
"""

from datetime import date, datetime, timedelta, timezone
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.cohort import Cohort, CohortStatus
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.phase import Phase
from app.models.program import Program
from app.models.resource import Resource, ResourceType
from app.models.session import Session, SessionStatus, SessionType
from app.models.team import Team, TeamMembership, TeamMemberRole
from app.models.user import User, UserRole
from app.models.week import Week


def seed_dlif():
    db = SessionLocal()
    try:
        print("[SEED] Seeding DLIF Program, Cohort, Phase, Weeks, and Sessions...")

        # 1. Program
        program = db.scalars(select(Program).where(Program.code == "DLIF")).first()
        if not program:
            program = Program(
                name="DegreeLabs Impact Fellowship",
                code="DLIF",
                description="The premier experiential learning fellowship program transforming fellows into high-impact practitioners.",
                is_active=True,
            )
            db.add(program)
            db.flush()
            print(f"  + Created Program: {program.name} ({program.code})")
        else:
            print(f"  * Existing Program: {program.name}")

        # 2. Cohort
        cohort = db.scalars(select(Cohort).where(Cohort.code == "2026-A")).first()
        if not cohort:
            cohort = Cohort(
                program_id=program.id,
                name="DLIF Cohort 2026-A",
                code="2026-A",
                start_date=date(2026, 10, 9),
                end_date=date(2026, 11, 6),
                status=CohortStatus.ACTIVE,
            )
            db.add(cohort)
            db.flush()
            print(f"  + Created Cohort: {cohort.name} ({cohort.code})")
        else:
            print(f"  * Existing Cohort: {cohort.name}")

        # 3. Phase: DISCOVER (THINK)
        phase = db.scalars(
            select(Phase).where(Phase.program_id == program.id, Phase.code == "DISCOVER")
        ).first()
        if not phase:
            phase = Phase(
                program_id=program.id,
                code="DISCOVER",
                name="DISCOVER",
                development_role="THINK",
                sequence=1,
                duration_weeks=4,
                description="The classroom gives knowledge. Discover builds capability.",
                is_active=True,
            )
            db.add(phase)
            db.flush()
            print(f"  + Created Phase: {phase.name} ({phase.development_role})")
        else:
            print(f"  * Existing Phase: {phase.name}")

        # 4. Weeks 1 to 4
        weeks_spec = [
            {
                "week_number": 1,
                "sequence": 1,
                "title": "DISCOVER THE REAL PROBLEM",
                "strategic_question": "What is really happening here?",
                "description": "Frame the business context, analyze company challenge findings, decompose the industry problem, and establish team collaboration workflows.",
            },
            {
                "week_number": 2,
                "sequence": 2,
                "title": "CREATE STRATEGIC POSSIBILITIES",
                "strategic_question": "What could we choose to do?",
                "description": "Conduct targeted inquiry, evaluate competitive solutions, and synthesize ≥3 Strategic possibilities using WWHTBT (What Would Have to Be True?) as the evidence filter.",
            },
            {
                "week_number": 3,
                "sequence": 3,
                "title": "DESIGN THE STRATEGY",
                "strategic_question": "How will we make this happen?",
                "description": "Develop the strategic choice, apply execution thinking to blueprint the roadmap, and build the Strategy & Execution Blueprint for review.",
            },
            {
                "week_number": 4,
                "sequence": 4,
                "title": "BUILD THE CASE FOR ACTION",
                "strategic_question": "Why should they believe and invest?",
                "description": "Synthesize all company challenge findings into three separate final outputs: Executive Proposal, Company Presentation, and Strategic Design Portfolio.",
            },
        ]

        weeks_map: dict[int, Week] = {}
        for w_spec in weeks_spec:
            week = db.scalars(
                select(Week).where(
                    Week.phase_id == phase.id,
                    Week.week_number == w_spec["week_number"],
                )
            ).first()
            if not week:
                week = Week(
                    phase_id=phase.id,
                    week_number=w_spec["week_number"],
                    sequence=w_spec["sequence"],
                    title=w_spec["title"],
                    strategic_question=w_spec["strategic_question"],
                    description=w_spec["description"],
                )
                db.add(week)
                db.flush()
                print(f"  + Created Week {week.week_number}: {week.title}")
            else:
                print(f"  * Existing Week {week.week_number}: {week.title}")
            weeks_map[week.week_number] = week

        # 5. Sessions 0 to 12
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=12, minute=30, second=0, microsecond=0)  # ~6:00 PM IST is 12:30 PM UTC

        sessions_spec = [
            # Week 1
            {
                "session_number": 0,
                "session_type": SessionType.INDUCTION,
                "title": "DLIF Onboarding & Program Setup",
                "description": "Welcome to DLIF, platform onboarding, squad assignments, and fellowship kickoff.",
                "sequence": 0,
                "week_number": 1,
                "status": SessionStatus.COMPLETED,
                "start_at": today_start - timedelta(days=3),
                "end_at": today_start - timedelta(days=3) + timedelta(hours=1, minutes=30),
                "recording_url": "https://player.vimeo.com/video/sample-session-0",
                "meeting_url": "https://meet.google.com/dlif-onboarding",
            },
            {
                "session_number": 1,
                "session_type": SessionType.LEARN_WORK,
                "title": "Business Context & Evidence",
                "description": "Problem space analysis, scope definition, and business diagnosis framing.",
                "sequence": 1,
                "week_number": 1,
                "status": SessionStatus.COMPLETED,
                "start_at": today_start - timedelta(days=2),
                "end_at": today_start - timedelta(days=2) + timedelta(hours=2),
                "recording_url": "https://player.vimeo.com/video/sample-session-1",
                "meeting_url": "https://meet.google.com/dlif-session-01",
            },
            {
                "session_number": 2,
                "session_type": SessionType.LEARN_WORK,
                "title": "Problem Framing & Diagnosis",
                "description": "Deconstruct the company challenge problem statement with our industry partner, identify core constraints, and map stakeholder requirements.",
                "sequence": 2,
                "week_number": 1,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(hours=2),
                "end_at": today_start + timedelta(hours=4),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-02",
            },
            {
                "session_number": 3,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Discovery Review",
                "description": "Gate 1 review of the Business Diagnosis & Problem Framing Pack with industry jury.",
                "sequence": 3,
                "week_number": 1,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=3),
                "end_at": today_start + timedelta(days=3, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-03",
            },
            # Week 2
            {
                "session_number": 4,
                "session_type": SessionType.LEARN_WORK,
                "title": "Research & Possibility Generation",
                "description": "Conduct targeted user inquiry and customer discovery.",
                "sequence": 4,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=5),
                "end_at": today_start + timedelta(days=5, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-04",
            },
            {
                "session_number": 5,
                "session_type": SessionType.LEARN_WORK,
                "title": "What Would Have to Be True? (WWHTBT)",
                "description": "Competitive landscape, benchmarking, and hypothesis conditions.",
                "sequence": 5,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=7),
                "end_at": today_start + timedelta(days=7, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-05",
            },
            {
                "session_number": 6,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Strategic Choice Review",
                "description": "Gate 2 review of Strategic Possibility & Choice Pack.",
                "sequence": 6,
                "week_number": 2,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=10),
                "end_at": today_start + timedelta(days=10, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-06",
            },
            # Week 3
            {
                "session_number": 7,
                "session_type": SessionType.LEARN_WORK,
                "title": "Integrated Strategy Choices",
                "description": "Ideation and feasibility matrix mapping.",
                "sequence": 7,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=12),
                "end_at": today_start + timedelta(days=12, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-07",
            },
            {
                "session_number": 8,
                "session_type": SessionType.LEARN_WORK,
                "title": "Execution Architecture",
                "description": "Solution architecture and Dedicated Team Mentor critiques.",
                "sequence": 8,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=14),
                "end_at": today_start + timedelta(days=14, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-08",
            },
            {
                "session_number": 9,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Strategy Review",
                "description": "Gate 3 review of Strategy & Execution Blueprint.",
                "sequence": 9,
                "week_number": 3,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=17),
                "end_at": today_start + timedelta(days=17, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-09",
            },
            # Week 4
            {
                "session_number": 10,
                "session_type": SessionType.LEARN_WORK,
                "title": "Proposal Architecture",
                "description": "Executive pitch deck and business case formation.",
                "sequence": 10,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=19),
                "end_at": today_start + timedelta(days=19, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-10",
            },
            {
                "session_number": 11,
                "session_type": SessionType.LEARN_WORK,
                "title": "Executive Communication",
                "description": "Company Presentation and Strategic Design Portfolio preparation.",
                "sequence": 11,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=21),
                "end_at": today_start + timedelta(days=21, hours=2),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-11",
            },
            {
                "session_number": 12,
                "session_type": SessionType.OUTPUT_REVIEW,
                "title": "Final DISCOVER Review",
                "description": "Final presentation to Company Challenge Owner & Industry Jury.",
                "sequence": 12,
                "week_number": 4,
                "status": SessionStatus.SCHEDULED,
                "start_at": today_start + timedelta(days=24),
                "end_at": today_start + timedelta(days=24, hours=3),
                "recording_url": None,
                "meeting_url": "https://meet.google.com/dlif-session-12",
            },
        ]

        for s_spec in sessions_spec:
            session = db.scalars(
                select(Session).where(
                    Session.cohort_id == cohort.id,
                    Session.session_number == s_spec["session_number"],
                )
            ).first()
            target_week = weeks_map.get(s_spec["week_number"])
            if not session:
                session = Session(
                    cohort_id=cohort.id,
                    phase_id=phase.id,
                    week_id=target_week.id if target_week else None,
                    session_number=s_spec["session_number"],
                    session_type=s_spec["session_type"],
                    title=s_spec["title"],
                    description=s_spec["description"],
                    start_at=s_spec["start_at"],
                    end_at=s_spec["end_at"],
                    status=s_spec["status"],
                    meeting_url=s_spec["meeting_url"],
                    recording_url=s_spec["recording_url"],
                    sequence=s_spec["sequence"],
                )
                db.add(session)
                print(f"  + Created Session {session.session_number}: {session.title}")
            else:
                # Update status and dates to keep fresh
                session.title = s_spec["title"]
                session.description = s_spec["description"]
                session.session_type = s_spec["session_type"]
                session.status = s_spec["status"]
                session.meeting_url = s_spec["meeting_url"]
                session.recording_url = s_spec["recording_url"]
                print(f"  * Synced Session {session.session_number}: {session.title}")

        # 6. Auto-enroll existing Fellow/Student users
        fellow_users = db.scalars(
            select(User).where(User.role.in_([UserRole.FELLOW, UserRole.STUDENT]))
        ).all()
        for u in fellow_users:
            enrollment = db.scalars(
                select(Enrollment).where(
                    Enrollment.user_id == u.id,
                    Enrollment.cohort_id == cohort.id,
                )
            ).first()
            if not enrollment:
                enrollment = Enrollment(
                    user_id=u.id,
                    cohort_id=cohort.id,
                    enrollment_status=EnrollmentStatus.ACTIVE,
                )
                db.add(enrollment)
                print(f"  + Enrolled Fellow: {u.first_name} {u.last_name} ({u.email}) in {cohort.code}")

        # 7. Seed a demonstration Team (Cikitsa India challenge) and assign all Fellows
        team = db.scalars(
            select(Team).where(
                Team.cohort_id == cohort.id,
                Team.name == "Alpha-4",
            )
        ).first()
        if not team:
            team = Team(
                cohort_id=cohort.id,
                name="Alpha-4",
                company_challenge="Cikitsa India — AI-powered Rural Healthcare Diagnostics",
                company_name="Cikitsa India",
                is_active=True,
            )
            db.add(team)
            db.flush()
            print(f"  + Created Team: {team.name} ({team.company_name})")
        else:
            print(f"  * Existing Team: {team.name}")

        # Assign all enrolled Fellows to team (idempotent)
        db.flush()
        for u in fellow_users:
            existing_member = db.scalars(
                select(TeamMembership).where(
                    TeamMembership.team_id == team.id,
                    TeamMembership.user_id == u.id,
                )
            ).first()
            if not existing_member:
                role = TeamMemberRole.LEAD if fellow_users.index(u) == 0 else TeamMemberRole.MEMBER
                membership = TeamMembership(
                    team_id=team.id,
                    cohort_id=cohort.id,
                    user_id=u.id,
                    team_role=role,
                )
                db.add(membership)
                print(f"  + Assigned {u.first_name} {u.last_name} to Team {team.name}")

        # 8. Seed DISCOVER Phase Resources
        resources_spec = [
            {
                "title": "DLIF Fellow Handbook — DISCOVER (v1.0, Sept 2026)",
                "subtitle": "PDF \u2022 v1.0 (Sept 2026)",
                "resource_type": ResourceType.HANDBOOK,
                "url": None,
                "is_downloadable": True,
                "sequence": 1,
            },
            {
                "title": "Problem Rubric & Guidelines",
                "subtitle": "Certificate in Problem Analysis & Solution Architecture (DISCOVER)",
                "resource_type": ResourceType.RUBRIC,
                "url": None,
                "is_downloadable": False,
                "sequence": 2,
            },
        ]

        for r_spec in resources_spec:
            existing_resource = db.scalars(
                select(Resource).where(
                    Resource.phase_id == phase.id,
                    Resource.title == r_spec["title"],
                )
            ).first()
            if not existing_resource:
                resource = Resource(
                    phase_id=phase.id,
                    title=r_spec["title"],
                    subtitle=r_spec["subtitle"],
                    resource_type=r_spec["resource_type"],
                    url=r_spec["url"],
                    is_downloadable=r_spec["is_downloadable"],
                    is_active=True,
                    sequence=r_spec["sequence"],
                )
                db.add(resource)
                print(f"  + Created Resource: {resource.title}")
            else:
                print(f"  * Existing Resource: {existing_resource.title}")

        db.commit()
        print("[SUCCESS] DLIF seed complete!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding DLIF: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_dlif()

