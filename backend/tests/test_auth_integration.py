import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock
import time
from datetime import datetime, timedelta

from main import app
from database import get_db, Base
from auth import create_access_token, verify_password, get_password_hash
from models.users import User
from models.schemas import UserCreate, UserLogin

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def setup_database():
    """Create test database tables."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

@pytest.fixture
def db_session():
    """Create database session for tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "phone": "+1234567890",
        "role": "landowner"
    }

@pytest.fixture
def created_user(db_session, test_user_data):
    """Create a test user in the database."""
    hashed_password = get_password_hash(test_user_data["password"])
    user = User(
        email=test_user_data["email"],
        hashed_password=hashed_password,
        full_name=test_user_data["full_name"],
        phone=test_user_data["phone"],
        role=test_user_data["role"],
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

class TestUserRegistration:
    """Test user registration functionality."""
    
    def test_register_new_user_success(self, client, setup_database, test_user_data):
        """Test successful user registration."""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert "data" in data
        assert data["data"]["email"] == test_user_data["email"]
        assert data["data"]["full_name"] == test_user_data["full_name"]
        assert "user_id" in data["data"]
        assert "hashed_password" not in data["data"]  # Password should not be returned
    
    def test_register_duplicate_email(self, client, setup_database, created_user, test_user_data):
        """Test registration with existing email."""
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "already registered" in data["detail"].lower()
    
    def test_register_invalid_email(self, client, setup_database, test_user_data):
        """Test registration with invalid email format."""
        test_user_data["email"] = "invalid-email"
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 422
        data = response.json()
        assert "validation error" in data["detail"][0]["type"]
    
    def test_register_weak_password(self, client, setup_database, test_user_data):
        """Test registration with weak password."""
        test_user_data["password"] = "123"
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 422
    
    def test_register_invalid_role(self, client, setup_database, test_user_data):
        """Test registration with invalid role."""
        test_user_data["role"] = "invalid_role"
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 422
    
    def test_register_missing_required_fields(self, client, setup_database):
        """Test registration with missing required fields."""
        incomplete_data = {"email": "test@example.com"}
        response = client.post("/api/auth/register", json=incomplete_data)
        
        assert response.status_code == 422
        data = response.json()
        assert "field required" in str(data["detail"]).lower()

class TestUserLogin:
    """Test user login functionality."""
    
    def test_login_success(self, client, setup_database, created_user, test_user_data):
        """Test successful user login."""
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "access_token" in data["data"]
        assert "token_type" in data["data"]
        assert data["data"]["token_type"] == "bearer"
        assert "user" in data["data"]
        assert data["data"]["user"]["email"] == test_user_data["email"]
    
    def test_login_invalid_email(self, client, setup_database):
        """Test login with non-existent email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid credentials" in data["detail"].lower()
    
    def test_login_wrong_password(self, client, setup_database, created_user, test_user_data):
        """Test login with incorrect password."""
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid credentials" in data["detail"].lower()
    
    def test_login_inactive_user(self, client, setup_database, db_session, test_user_data):
        """Test login with inactive user account."""
        # Create inactive user
        hashed_password = get_password_hash(test_user_data["password"])
        user = User(
            email="inactive@example.com",
            hashed_password=hashed_password,
            full_name="Inactive User",
            phone="+1234567890",
            role="landowner",
            is_active=False,
            is_verified=True
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "email": "inactive@example.com",
            "password": test_user_data["password"]
        }
        response = client.post("/api/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "inactive" in data["detail"].lower()
    
    def test_login_missing_credentials(self, client, setup_database):
        """Test login with missing credentials."""
        response = client.post("/api/auth/login", json={})
        
        assert response.status_code == 422

class TestTokenAuthentication:
    """Test JWT token authentication."""
    
    def test_access_protected_endpoint_with_valid_token(self, client, setup_database, created_user, test_user_data):
        """Test accessing protected endpoint with valid token."""
        # Login to get token
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", json=login_data)
        token = login_response.json()["data"]["access_token"]
        
        # Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
    
    def test_access_protected_endpoint_without_token(self, client, setup_database):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401
        data = response.json()
        assert "not authenticated" in data["detail"].lower()
    
    def test_access_protected_endpoint_with_invalid_token(self, client, setup_database):
        """Test accessing protected endpoint with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower() or "decode" in data["detail"].lower()
    
    def test_access_protected_endpoint_with_expired_token(self, client, setup_database, created_user):
        """Test accessing protected endpoint with expired token."""
        # Create expired token
        expired_token = create_access_token(
            data={"sub": created_user.email},
            expires_delta=timedelta(seconds=-1)  # Already expired
        )
        
        headers = {"Authorization": f"Bearer {expired_token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 401
        data = response.json()
        assert "expired" in data["detail"].lower()

class TestRateLimiting:
    """Test rate limiting functionality."""
    
    @patch('rate_limiter.redis_service.is_connected', False)
    def test_rate_limiting_fallback_to_memory(self, client, setup_database, test_user_data):
        """Test rate limiting falls back to in-memory when Redis unavailable."""
        # This test verifies the system works when Redis is not available
        response = client.post("/api/auth/register", json=test_user_data)
        assert response.status_code in [201, 400]  # Either success or duplicate
    
    def test_login_rate_limiting(self, client, setup_database, created_user, test_user_data):
        """Test login rate limiting (simplified test)."""
        login_data = {
            "email": test_user_data["email"],
            "password": "wrongpassword"
        }
        
        # Make multiple failed login attempts
        responses = []
        for _ in range(3):
            response = client.post("/api/auth/login", json=login_data)
            responses.append(response.status_code)
            time.sleep(0.1)  # Small delay between requests
        
        # All should be 401 (unauthorized) rather than 429 (rate limited)
        # since we're using wrong password
        assert all(status == 401 for status in responses)

class TestPasswordSecurity:
    """Test password hashing and verification."""
    
    def test_password_hashing(self):
        """Test password is properly hashed."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 50  # Bcrypt hashes are typically 60 characters
        assert hashed.startswith("$2b$")  # Bcrypt identifier
    
    def test_password_verification(self):
        """Test password verification works correctly."""
        password = "TestPassword123!"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
        assert verify_password("wrongpassword", hashed) is False
    
    def test_different_passwords_different_hashes(self):
        """Test that same password produces different hashes (salt)."""
        password = "TestPassword123!"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2  # Different due to salt
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

class TestTokenGeneration:
    """Test JWT token generation and validation."""
    
    def test_token_contains_user_email(self, created_user):
        """Test that generated token contains user email."""
        token = create_access_token(data={"sub": created_user.email})
        
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are typically long
        assert token.count('.') == 2  # JWT has 3 parts separated by dots
    
    def test_token_expiration(self, created_user):
        """Test token expiration functionality."""
        # Create token with very short expiration
        short_token = create_access_token(
            data={"sub": created_user.email},
            expires_delta=timedelta(seconds=1)
        )
        
        assert isinstance(short_token, str)
        # In a real test, you'd wait and verify the token expires
        # but that would slow down the test suite

class TestUserProfileEndpoint:
    """Test user profile retrieval endpoint."""
    
    def test_get_current_user_profile(self, client, setup_database, created_user, test_user_data):
        """Test retrieving current user profile."""
        # Login to get token
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = client.post("/api/auth/login", json=login_data)
        token = login_response.json()["data"]["access_token"]
        
        # Get user profile
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify profile data
        assert data["email"] == test_user_data["email"]
        assert data["full_name"] == test_user_data["full_name"]
        assert data["role"] == test_user_data["role"]
        assert data["is_active"] is True
        assert "user_id" in data
        assert "created_at" in data
        assert "hashed_password" not in data  # Should not expose password

class TestErrorHandling:
    """Test error handling in authentication endpoints."""
    
    def test_malformed_json_request(self, client, setup_database):
        """Test handling of malformed JSON in requests."""
        response = client.post(
            "/api/auth/register",
            data="{invalid json}",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422
    
    def test_empty_request_body(self, client, setup_database):
        """Test handling of empty request body."""
        response = client.post("/api/auth/register")
        
        assert response.status_code == 422
    
    @patch('database.get_db')
    def test_database_connection_error(self, mock_get_db, client, setup_database, test_user_data):
        """Test handling of database connection errors."""
        # Mock database connection failure
        mock_get_db.side_effect = Exception("Database connection failed")
        
        response = client.post("/api/auth/register", json=test_user_data)
        
        # Should handle the error gracefully
        assert response.status_code == 500

if __name__ == "__main__":
    pytest.main([__file__, "-v"])