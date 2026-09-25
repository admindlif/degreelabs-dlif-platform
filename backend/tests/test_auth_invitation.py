"""
Comprehensive test suite for Phase 1: Authentication & Student Onboarding.

Covers:
- Student invitation creation by Admin
- Duplicate student email rejection
- Unauthenticated & non-admin role restrictions
- Account activation with token
- Expired & already-used token handling
- Password validation (length, match)
- TOTP 2FA setup & QR URI generation
- TOTP verification & account activation to 'active'
- Recovery codes generation and usage
- Two-stage login flow (password -> 2FA challenge -> verify)
- Incorrect password & invalid TOTP codes
- Suspended account handling
- GET /api/v1/auth/me safe profile inspection
"""

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pyotp
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_invitation_token, hash_password
from app.models.user import AccountStatus, User, UserRole
from app.models.user_invitation import UserInvitationToken
from app.models.user_recovery_code import UserRecoveryCode
from app.services.auth import admin_create_student
from app.schemas.auth import CreateStudentRequest


# ---------------------------------------------------------------------------
# 1. Admin Student Invitation Tests
# ---------------------------------------------------------------------------

def test_admin_create_student_success(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    """Admin can create a new student and generate a hashed invitation token."""
    email = f"student_{uuid4().hex[:8]}@example.com"
    payload = {
        "first_name": "Samantha",
        "last_name": "R",
        "email": email,
    }

    response = client.post(
        "/api/v1/admin/students",
        json=payload,
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == email
    assert data["first_name"] == "Samantha"
    assert data["last_name"] == "R"
    assert data["role"] in ("fellow", "student")
    assert data["account_status"] == "invited"
    assert "id" in data

    # Verify database state
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None
    assert user.password_hash is None
    assert user.two_factor_enabled is False
    assert user.account_status == AccountStatus.INVITED
    assert user.role in (UserRole.FELLOW, UserRole.STUDENT)

    # Verify invitation token exists and only hash is stored
    invitation = db.scalar(
        select(UserInvitationToken).where(UserInvitationToken.user_id == user.id)
    )
    assert invitation is not None
    assert len(invitation.token_hash) == 64
    assert invitation.used_at is None
    assert invitation.expires_at > datetime.now(timezone.utc)

    # Cleanup
    db.delete(invitation)
    db.delete(user)
    db.commit()


def test_admin_create_student_unauthenticated(client: TestClient):
    """Unauthenticated requests to admin endpoint must return 401."""
    response = client.post(
        "/api/v1/admin/students",
        json={"first_name": "Test", "last_name": "Student", "email": "test@example.com"},
    )
    assert response.status_code == 401


def test_student_cannot_access_admin_endpoint(
    client: TestClient,
    db: Session,
):
    """Students cannot access admin endpoints (must return 403)."""
    email = f"student_{uuid4().hex[:8]}@example.com"
    student = User(
        first_name="Alice",
        last_name="Student",
        email=email,
        password_hash=hash_password("Pass12345!"),
        role=UserRole.STUDENT,
        account_status=AccountStatus.ACTIVE,
        is_active=True,
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    token = create_access_token(str(student.id))
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/v1/admin/students",
        json={"first_name": "Bob", "last_name": "Student", "email": "bob@example.com"},
        headers=headers,
    )
    assert response.status_code == 403

    # Cleanup
    db.delete(student)
    db.commit()


def test_admin_create_student_duplicate_email(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    """Creating student with existing email returns 409 Conflict."""
    email = f"dup_{uuid4().hex[:8]}@example.com"
    payload = {"first_name": "Original", "last_name": "User", "email": email}

    resp1 = client.post("/api/v1/admin/students", json=payload, headers=admin_headers)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/admin/students", json=payload, headers=admin_headers)
    assert resp2.status_code == 409

    # Cleanup
    user = db.scalar(select(User).where(User.email == email))
    if user:
        tokens = db.scalars(
            select(UserInvitationToken).where(UserInvitationToken.user_id == user.id)
        ).all()
        for t in tokens:
            db.delete(t)
        db.delete(user)
        db.commit()


# ---------------------------------------------------------------------------
# 2. Account Activation & Validation Tests
# ---------------------------------------------------------------------------

def test_activate_account_validation_errors(
    client: TestClient,
    db: Session,
):
    """Activation validates password length, confirmation, and token validity."""
    # Passwords do not match
    resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": "some_token",
            "password": "Password123!",
            "confirm_password": "MismatchPassword!",
        },
    )
    assert resp.status_code == 422

    # Password too short (< 8 chars)
    resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": "some_token",
            "password": "short",
            "confirm_password": "short",
        },
    )
    assert resp.status_code == 422

    # Non-existent token
    resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": "nonexistent_raw_token",
            "password": "ValidPassword123!",
            "confirm_password": "ValidPassword123!",
        },
    )
    assert resp.status_code == 400
    assert "Invalid or expired" in resp.json()["detail"]


def test_activate_account_expired_token(
    client: TestClient,
    db: Session,
):
    """Activation with an expired token returns 400 Bad Request."""
    email = f"expired_{uuid4().hex[:8]}@example.com"
    req = CreateStudentRequest(first_name="Exp", last_name="User", email=email)
    user, raw_token = admin_create_student(db, req)

    # Manually expire the token in database
    token_hash = hash_invitation_token(raw_token)
    inv = db.scalar(
        select(UserInvitationToken).where(UserInvitationToken.token_hash == token_hash)
    )
    inv.expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db.commit()

    resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": raw_token,
            "password": "ValidPassword123!",
            "confirm_password": "ValidPassword123!",
        },
    )
    assert resp.status_code == 400
    assert "expired" in resp.json()["detail"].lower()

    # Cleanup
    db.delete(inv)
    db.delete(user)
    db.commit()


# ---------------------------------------------------------------------------
# 3. Full End-to-End Onboarding & Two-Stage Login Flow
# ---------------------------------------------------------------------------

def test_full_student_onboarding_and_auth_lifecycle(
    client: TestClient,
    admin_headers: dict[str, str],
    db: Session,
):
    """
    Complete lifecycle verification against Definition of Done:
    1. Admin creates student (role=student, account_status=invited, password_hash=NULL, 2FA=false)
    2. Student activates account with invitation token (sets password, token marked used)
    3. Token cannot be reused
    4. Student sets up TOTP 2FA (receives QR URI & secret)
    5. Student confirms TOTP with valid code (account_status=active, 2FA=true, receives recovery codes)
    6. Student performs stage 1 login (email + password -> challenge_token)
    7. Student completes stage 2 login with TOTP code (challenge_token + code -> access_token)
    8. Student calls GET /api/v1/auth/me (returns student profile, no sensitive leaks)
    9. Student cannot access admin endpoints
    """
    student_email = f"lifecycle_{uuid4().hex[:8]}@example.com"

    # Step 1: Admin creates student
    create_resp = client.post(
        "/api/v1/admin/students",
        json={
            "first_name": "Marcus",
            "last_name": "Vance",
            "email": student_email,
        },
        headers=admin_headers,
    )
    assert create_resp.status_code == 201

    # Extract the created invitation token from database
    user = db.scalar(select(User).where(User.email == student_email))
    assert user is not None
    assert user.account_status == AccountStatus.INVITED
    assert user.password_hash is None
    assert user.two_factor_enabled is False

    inv = db.scalar(
        select(UserInvitationToken).where(UserInvitationToken.user_id == user.id)
    )
    assert inv is not None

    # For the test, create a known raw token so we can test the activate endpoint
    from app.core.security import generate_invitation_token
    test_raw_token = generate_invitation_token()
    inv.token_hash = hash_invitation_token(test_raw_token)
    db.commit()

    # Step 2: Student activates account
    student_password = "SecureStudentPass987!"
    activate_resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": test_raw_token,
            "password": student_password,
            "confirm_password": student_password,
        },
    )
    assert activate_resp.status_code == 200
    act_data = activate_resp.json()
    assert act_data["email"] == student_email
    onboarding_token = act_data["access_token"]
    assert onboarding_token is not None

    # Verify invitation token is marked used and password is saved
    db.refresh(inv)
    assert inv.used_at is not None

    db.refresh(user)
    assert user.password_hash is not None
    assert user.password_set_at is not None
    assert user.email_verified_at is not None
    # Account status remains invited until 2FA confirmation
    assert user.account_status == AccountStatus.INVITED

    # Step 3: Invitation token cannot be used again
    reuse_resp = client.post(
        "/api/v1/auth/activate",
        json={
            "token": test_raw_token,
            "password": "AnotherPassword123!",
            "confirm_password": "AnotherPassword123!",
        },
    )
    assert reuse_resp.status_code == 400
    assert "already been used" in reuse_resp.json()["detail"].lower()

    # Step 4: 2FA Setup
    onboarding_headers = {"Authorization": f"Bearer {onboarding_token}"}
    setup_resp = client.post(
        "/api/v1/auth/2fa/setup",
        headers=onboarding_headers,
    )
    assert setup_resp.status_code == 200
    setup_data = setup_resp.json()
    assert "totp_uri" in setup_data
    assert "secret" in setup_data
    totp_secret = setup_data["secret"]
    assert setup_data["totp_uri"].startswith("otpauth://totp/")

    # Step 5: 2FA Confirmation
    # Test invalid code first
    invalid_confirm = client.post(
        "/api/v1/auth/2fa/confirm",
        json={"code": "000000"},
        headers=onboarding_headers,
    )
    assert invalid_confirm.status_code == 422

    # Valid TOTP code
    totp = pyotp.TOTP(totp_secret)
    valid_code = totp.now()

    confirm_resp = client.post(
        "/api/v1/auth/2fa/confirm",
        json={"code": valid_code},
        headers=onboarding_headers,
    )
    assert confirm_resp.status_code == 200
    confirm_data = confirm_resp.json()
    assert "recovery_codes" in confirm_data
    recovery_codes = confirm_data["recovery_codes"]
    assert len(recovery_codes) == 8

    # Verify user is now fully active
    db.refresh(user)
    assert user.account_status == AccountStatus.ACTIVE
    assert user.two_factor_enabled is True

    # Step 6: Two-stage login - Stage 1 (Password)
    # Incorrect password test
    bad_login = client.post(
        "/api/v1/auth/login",
        json={"email": student_email, "password": "WrongPassword123!"},
    )
    assert bad_login.status_code == 401

    # Valid credentials
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": student_email, "password": student_password},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["requires_2fa"] is True
    challenge_token = login_data["challenge_token"]
    assert challenge_token is not None

    # Step 7: Two-stage login - Stage 2 (TOTP verification)
    # Invalid TOTP test
    bad_verify = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token, "code": "000000"},
    )
    assert bad_verify.status_code == 401

    # Valid TOTP test
    verify_resp = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge_token, "code": totp.now()},
    )
    assert verify_resp.status_code == 200
    token_data = verify_resp.json()
    assert "access_token" in token_data
    access_token = token_data["access_token"]

    # Step 8: GET /api/v1/auth/me
    student_headers = {"Authorization": f"Bearer {access_token}"}
    me_resp = client.get("/api/v1/auth/me", headers=student_headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == student_email
    assert me_data["first_name"] == "Marcus"
    assert me_data["last_name"] == "Vance"
    assert me_data["role"] in ("fellow", "student")
    assert me_data["account_status"] == "active"
    assert me_data["two_factor_enabled"] is True

    # Sensitive fields must NOT be present
    assert "password_hash" not in me_data
    assert "totp_secret" not in me_data

    # Step 9: Student cannot access admin endpoints
    forbidden_admin = client.post(
        "/api/v1/admin/students",
        json={"first_name": "Hacker", "last_name": "X", "email": "hacker@example.com"},
        headers=student_headers,
    )
    assert forbidden_admin.status_code == 403

    # Step 10: Test Recovery Code Login
    # Trigger a new login challenge
    login2 = client.post(
        "/api/v1/auth/login",
        json={"email": student_email, "password": student_password},
    )
    challenge2 = login2.json()["challenge_token"]

    # Verify with first recovery code
    used_recovery_code = recovery_codes[0]
    rec_verify = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge2, "code": used_recovery_code},
    )
    assert rec_verify.status_code == 200
    assert "access_token" in rec_verify.json()

    # Recovery code cannot be used twice
    login3 = client.post(
        "/api/v1/auth/login",
        json={"email": student_email, "password": student_password},
    )
    challenge3 = login3.json()["challenge_token"]
    rec_reuse = client.post(
        "/api/v1/auth/2fa/verify",
        json={"challenge_token": challenge3, "code": used_recovery_code},
    )
    assert rec_reuse.status_code == 401

    # Cleanup
    db.scalars(
        select(UserRecoveryCode).where(UserRecoveryCode.user_id == user.id)
    ).all()
    from sqlalchemy import delete
    db.execute(delete(UserRecoveryCode).where(UserRecoveryCode.user_id == user.id))
    db.execute(delete(UserInvitationToken).where(UserInvitationToken.user_id == user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()


def test_suspended_account_rejected(
    client: TestClient,
    db: Session,
):
    """Suspended user cannot log in and existing tokens are rejected."""
    email = f"suspended_{uuid4().hex[:8]}@example.com"
    user = User(
        first_name="Suspended",
        last_name="User",
        email=email,
        password_hash=hash_password("Pass12345!"),
        role=UserRole.STUDENT,
        account_status=AccountStatus.SUSPENDED,
        two_factor_enabled=True,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Login fails
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Pass12345!"},
    )
    assert resp.status_code == 403
    assert "suspended" in resp.json()["detail"].lower()

    # Even with a valid token, /me rejects suspended accounts
    token = create_access_token(str(user.id))
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 403

    # Cleanup
    db.delete(user)
    db.commit()
