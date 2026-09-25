"""
Shared test configuration and fixtures for backend test suite.
"""

from typing import Generator
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal, get_db
from app.main import app
from app.models.user import AccountStatus, User, UserRole
from app.models.user_invitation import UserInvitationToken
from app.models.user_recovery_code import UserRecoveryCode


@pytest.fixture(scope="session")
def db_session() -> Generator[Session, None, None]:
    """Provide a database session for the test session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def db() -> Generator[Session, None, None]:
    """Provide a fresh database session per test with rollback/cleanup."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with database dependency override."""
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(db: Session) -> Generator[User, None, None]:
    """Create a persistent active admin user for test cases."""
    email = f"admin_{uuid4().hex[:8]}@example.com"
    user = User(
        first_name="Admin",
        last_name="User",
        email=email,
        password_hash=hash_password("AdminSecret123!"),
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
        two_factor_enabled=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    yield user

    # Teardown
    db.execute(delete(UserRecoveryCode).where(UserRecoveryCode.user_id == user.id))
    db.execute(delete(UserInvitationToken).where(UserInvitationToken.user_id == user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Return a valid JWT access token for the test admin user."""
    return create_access_token(str(admin_user.id))


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    """Authorization header with Bearer token for the test admin."""
    return {"Authorization": f"Bearer {admin_token}"}
