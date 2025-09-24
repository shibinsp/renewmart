import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock
import time
from datetime import datetime, timedelta

from main import app
from database import get_db, Base
from auth import create_access_token, get_password_hash
from models.user import User

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_health_cache.db"
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
def admin_user(db_session):
    """Create an admin user for testing."""
    hashed_password = get_password_hash("AdminPassword123!")
    user = User(
        email="admin@example.com",
        hashed_password=hashed_password,
        full_name="Admin User",
        phone="+1234567890",
        role="admin",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def regular_user(db_session):
    """Create a regular user for testing."""
    hashed_password = get_password_hash("UserPassword123!")
    user = User(
        email="user@example.com",
        hashed_password=hashed_password,
        full_name="Regular User",
        phone="+1234567890",
        role="landowner",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_token(admin_user):
    """Create admin JWT token."""
    return create_access_token(data={"sub": admin_user.email})

@pytest.fixture
def user_token(regular_user):
    """Create regular user JWT token."""
    return create_access_token(data={"sub": regular_user.email})

class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_basic_health_check_success(self, client, setup_database):
        """Test basic health check endpoint returns success."""
        response = client.get("/api/health/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "timestamp" in data
        assert "version" in data
        assert "services" in data
        assert "response_time_ms" in data
        
        # Check service statuses
        services = data["services"]
        assert "database" in services
        assert "redis" in services
        assert "rate_limiter" in services
    
    def test_health_check_no_auth_required(self, client, setup_database):
        """Test that basic health check doesn't require authentication."""
        response = client.get("/api/health/")
        assert response.status_code == 200
    
    @patch('database.engine.connect')
    def test_health_check_database_failure(self, mock_connect, client, setup_database):
        """Test health check when database is unavailable."""
        mock_connect.side_effect = Exception("Database connection failed")
        
        response = client.get("/api/health/")
        
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "errors" in data
        assert any("Database" in error for error in data["errors"])
    
    def test_detailed_health_check_requires_admin(self, client, setup_database, user_token):
        """Test that detailed health check requires admin privileges."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/api/health/detailed", headers=headers)
        
        assert response.status_code == 403
        data = response.json()
        assert "admin privileges required" in data["detail"].lower()
    
    def test_detailed_health_check_admin_success(self, client, setup_database, admin_token):
        """Test detailed health check with admin privileges."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/health/detailed", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check comprehensive health data
        assert "status" in data
        assert "system" in data
        assert "database" in data
        assert "redis" in data
        assert "performance" in data
        assert "environment" in data
        
        # Check system metrics
        system = data["system"]
        assert "cpu_percent" in system
        assert "memory_percent" in system
        assert "disk_usage_percent" in system
    
    def test_detailed_health_check_no_auth(self, client, setup_database):
        """Test detailed health check without authentication."""
        response = client.get("/api/health/detailed")
        
        assert response.status_code == 401
        data = response.json()
        assert "not authenticated" in data["detail"].lower()
    
    def test_metrics_endpoint_requires_admin(self, client, setup_database, user_token):
        """Test that metrics endpoint requires admin privileges."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/api/health/metrics", headers=headers)
        
        assert response.status_code == 403
    
    def test_metrics_endpoint_admin_success(self, client, setup_database, admin_token):
        """Test metrics endpoint with admin privileges."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/health/metrics", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check metrics structure
        assert "timestamp" in data
        assert "system" in data
        assert "database" in data
        assert "application" in data
        
        # Check system metrics
        system = data["system"]
        assert "cpu_percent" in system
        assert "memory_usage_bytes" in system
        assert "threads" in system
    
    def test_readiness_probe(self, client, setup_database):
        """Test Kubernetes-style readiness probe."""
        response = client.get("/api/health/readiness")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "ready"
        assert "timestamp" in data
        assert "checks" in data
        assert data["checks"]["database"] == "ready"
    
    @patch('database.engine.connect')
    def test_readiness_probe_database_failure(self, mock_connect, client, setup_database):
        """Test readiness probe when database is not ready."""
        mock_connect.side_effect = Exception("Database not ready")
        
        response = client.get("/api/health/readiness")
        
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "not_ready"
    
    def test_liveness_probe(self, client, setup_database):
        """Test Kubernetes-style liveness probe."""
        response = client.get("/api/health/liveness")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "alive"
        assert "timestamp" in data
        assert "pid" in data
        assert isinstance(data["pid"], int)

class TestCacheEndpoints:
    """Test cache management endpoints."""
    
    def test_cache_status_requires_auth(self, client, setup_database):
        """Test that cache status endpoint requires authentication."""
        response = client.get("/api/cache/status")
        
        assert response.status_code == 401
    
    def test_cache_status_success(self, client, setup_database, admin_token):
        """Test cache status endpoint with admin token."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/cache/status", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "redis_health" in data
        assert "cache_stats" in data
        assert "timestamp" in data
    
    def test_cache_invalidate_requires_admin(self, client, setup_database, user_token):
        """Test that cache invalidation requires admin privileges."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.delete("/api/cache/invalidate?pattern=test:*", headers=headers)
        
        assert response.status_code == 403
        data = response.json()
        assert "admin privileges required" in data["detail"].lower()
    
    def test_cache_invalidate_missing_pattern(self, client, setup_database, admin_token):
        """Test cache invalidation with missing pattern parameter."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete("/api/cache/invalidate", headers=headers)
        
        assert response.status_code == 422  # Missing required parameter
    
    def test_cache_invalidate_empty_pattern(self, client, setup_database, admin_token):
        """Test cache invalidation with empty pattern."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete("/api/cache/invalidate?pattern=", headers=headers)
        
        assert response.status_code == 400
        data = response.json()
        assert "pattern is required" in data["detail"].lower()
    
    @patch('redis_service.cache_manager.invalidate_pattern')
    def test_cache_invalidate_success(self, mock_invalidate, client, setup_database, admin_token):
        """Test successful cache invalidation."""
        mock_invalidate.return_value = 5  # 5 keys deleted
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete("/api/cache/invalidate?pattern=user:123:*", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["message"] == "Cache invalidated successfully"
        assert data["data"]["pattern"] == "user:123:*"
        assert data["data"]["keys_deleted"] == 5
        mock_invalidate.assert_called_once_with("user:123:*")
    
    def test_clear_user_cache_requires_auth(self, client, setup_database):
        """Test that clearing user cache requires authentication."""
        response = client.delete("/api/cache/user/123")
        
        assert response.status_code == 401
    
    def test_clear_user_cache_admin_success(self, client, setup_database, admin_token):
        """Test admin can clear any user's cache."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        with patch('redis_service.cache_manager.clear_user_cache') as mock_clear:
            mock_clear.return_value = 3  # 3 keys deleted
            
            response = client.delete("/api/cache/user/123", headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["message"] == "User cache cleared successfully"
            assert data["data"]["user_id"] == "123"
            assert data["data"]["keys_deleted"] == 3
    
    def test_clear_own_cache_success(self, client, setup_database, regular_user, user_token):
        """Test user can clear their own cache."""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        with patch('redis_service.cache_manager.clear_user_cache') as mock_clear:
            mock_clear.return_value = 2  # 2 keys deleted
            
            response = client.delete(f"/api/cache/user/{regular_user.user_id}", headers=headers)
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["message"] == "User cache cleared successfully"
    
    def test_clear_other_user_cache_forbidden(self, client, setup_database, user_token):
        """Test regular user cannot clear another user's cache."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.delete("/api/cache/user/999", headers=headers)
        
        assert response.status_code == 403
        data = response.json()
        assert "admin privileges required" in data["detail"].lower()
    
    def test_active_sessions_requires_admin(self, client, setup_database, user_token):
        """Test that active sessions endpoint requires admin privileges."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = client.get("/api/cache/sessions/active", headers=headers)
        
        assert response.status_code == 403
    
    def test_active_sessions_admin_success(self, client, setup_database, admin_token):
        """Test active sessions endpoint with admin privileges."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/cache/sessions/active", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "timestamp" in data
        # The response structure depends on Redis availability
        assert "message" in data or "total_sessions" in data

class TestRateLimitingIntegration:
    """Test rate limiting integration with health and cache endpoints."""
    
    def test_health_endpoint_rate_limiting(self, client, setup_database):
        """Test rate limiting on health endpoints."""
        # Make multiple requests to health endpoint
        responses = []
        for _ in range(5):
            response = client.get("/api/health/")
            responses.append(response.status_code)
            time.sleep(0.01)  # Small delay
        
        # All should succeed (rate limit is generous for health checks)
        assert all(status == 200 for status in responses)
    
    def test_admin_endpoint_rate_limiting(self, client, setup_database, admin_token):
        """Test rate limiting on admin endpoints."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Make multiple requests to admin endpoint
        responses = []
        for _ in range(3):
            response = client.get("/api/health/metrics", headers=headers)
            responses.append(response.status_code)
            time.sleep(0.01)
        
        # Should succeed within rate limits
        assert all(status == 200 for status in responses)

class TestErrorHandling:
    """Test error handling in health and cache endpoints."""
    
    @patch('redis_service.redis_service.get_health_status')
    def test_cache_status_redis_error(self, mock_redis_health, client, setup_database, admin_token):
        """Test cache status endpoint when Redis throws an error."""
        mock_redis_health.side_effect = Exception("Redis connection failed")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/cache/status", headers=headers)
        
        assert response.status_code == 500
        data = response.json()
        assert "failed to retrieve cache status" in data["detail"].lower()
    
    @patch('redis_service.cache_manager.invalidate_pattern')
    def test_cache_invalidate_error(self, mock_invalidate, client, setup_database, admin_token):
        """Test cache invalidation when operation fails."""
        mock_invalidate.side_effect = Exception("Cache operation failed")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.delete("/api/cache/invalidate?pattern=test:*", headers=headers)
        
        assert response.status_code == 500
        data = response.json()
        assert "failed to invalidate cache" in data["detail"].lower()
    
    @patch('psutil.cpu_percent')
    def test_metrics_system_error(self, mock_cpu, client, setup_database, admin_token):
        """Test metrics endpoint when system monitoring fails."""
        mock_cpu.side_effect = Exception("System monitoring failed")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/api/health/metrics", headers=headers)
        
        # Should still return 200 but with limited metrics
        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data

class TestResponseFormats:
    """Test response format consistency."""
    
    def test_health_response_format(self, client, setup_database):
        """Test health endpoint response format consistency."""
        response = client.get("/api/health/")
        data = response.json()
        
        # Check required fields are present
        required_fields = ["status", "timestamp", "version", "services"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Check timestamp format
        timestamp = data["timestamp"]
        assert isinstance(timestamp, str)
        # Should be ISO format
        datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    
    def test_cache_response_format(self, client, setup_database, admin_token):
        """Test cache endpoint response format consistency."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        with patch('redis_service.cache_manager.invalidate_pattern') as mock_invalidate:
            mock_invalidate.return_value = 5
            
            response = client.delete("/api/cache/invalidate?pattern=test:*", headers=headers)
            data = response.json()
            
            # Check SuccessResponse format
            assert "message" in data
            assert "data" in data
            assert isinstance(data["data"], dict)
            
            # Check data structure
            cache_data = data["data"]
            assert "pattern" in cache_data
            assert "keys_deleted" in cache_data
            assert "timestamp" in cache_data

if __name__ == "__main__":
    pytest.main([__file__, "-v"])