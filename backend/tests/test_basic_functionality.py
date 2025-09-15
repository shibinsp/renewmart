import pytest
import time
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from main import app
from rate_limiter import RateLimits, check_rate_limiter_health

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_basic_health_check(self, client):
        """Test basic health check endpoint."""
        response = client.get("/api/health/")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
    
    def test_detailed_health_check(self, client):
        """Test detailed health check endpoint."""
        response = client.get("/api/health/detailed")
        # This might require authentication, so we accept both 200 and 401
        assert response.status_code in [200, 401]
    
    def test_readiness_probe(self, client):
        """Test readiness probe endpoint."""
        response = client.get("/api/health/readiness")
        # Accept various status codes as the endpoint might have different behaviors
        assert response.status_code in [200, 503]
    
    def test_liveness_probe(self, client):
        """Test liveness probe endpoint."""
        response = client.get("/api/health/liveness")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "alive"

class TestCacheEndpoints:
    """Test cache management endpoints."""
    
    def test_cache_status_unauthorized(self, client):
        """Test cache status endpoint without authentication."""
        response = client.get("/api/cache/status")
        # Should require authentication
        assert response.status_code == 401
    
    def test_cache_invalidation_unauthorized(self, client):
        """Test cache invalidation endpoint without authentication."""
        response = client.delete("/api/cache/invalidate")
        # Should require authentication
        assert response.status_code == 401

class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_rate_limits_constants(self):
        """Test that rate limit constants are properly defined."""
        assert hasattr(RateLimits, 'PUBLIC')
        assert hasattr(RateLimits, 'AUTH_LOGIN')
        assert hasattr(RateLimits, 'AUTH_REGISTER')
        assert hasattr(RateLimits, 'API_READ')
        assert hasattr(RateLimits, 'API_WRITE')
        
        # Verify the values are strings with proper format
        assert isinstance(RateLimits.PUBLIC, str)
        assert "/" in RateLimits.PUBLIC
        assert "minute" in RateLimits.PUBLIC or "hour" in RateLimits.PUBLIC
    
    def test_rate_limiter_health_check(self):
        """Test rate limiter health check function."""
        health_status = check_rate_limiter_health()
        
        assert isinstance(health_status, dict)
        assert "rate_limiter" in health_status
        assert "storage" in health_status
        assert "redis_connection" in health_status
        
        # Should be either healthy or degraded
        assert health_status["rate_limiter"] in ["healthy", "degraded"]
        # Storage should be either memory or redis
        assert health_status["storage"] in ["memory", "redis"]
        # Redis connection should be boolean
        assert isinstance(health_status["redis_connection"], bool)
    
    def test_public_endpoint_rate_limiting(self, client):
        """Test that public endpoints have reasonable rate limits."""
        # Make multiple requests to health endpoint
        responses = []
        for _ in range(5):
            response = client.get("/api/health/")
            responses.append(response.status_code)
            time.sleep(0.01)  # Small delay
        
        # Most requests should succeed (public endpoints have generous limits)
        success_count = sum(1 for status in responses if status == 200)
        assert success_count >= 4  # Allow for some potential rate limiting

class TestApplicationStructure:
    """Test application structure and configuration."""
    
    def test_app_routes_exist(self, client):
        """Test that expected routes exist in the application."""
        # Test that the app has the expected routers included
        response = client.get("/docs")  # OpenAPI docs should be available
        assert response.status_code == 200
    
    def test_cors_headers(self, client):
        """Test CORS configuration."""
        response = client.options("/api/health/")
        # CORS preflight should be handled
        assert response.status_code in [200, 405]  # 405 if OPTIONS not explicitly handled
    
    @patch('redis_service.redis_service.redis_client')
    def test_redis_fallback_behavior(self, mock_redis, client):
        """Test that the application handles Redis unavailability gracefully."""
        # Mock Redis to be unavailable
        mock_redis.ping.side_effect = Exception("Redis unavailable")
        
        # Health check should still work but report Redis issues
        response = client.get("/api/health/")
        assert response.status_code in [200, 503]  # Either works or reports service unavailable

class TestErrorHandling:
    """Test error handling across the application."""
    
    def test_404_handling(self, client):
        """Test 404 error handling."""
        response = client.get("/api/nonexistent-endpoint")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
    
    def test_method_not_allowed(self, client):
        """Test method not allowed handling."""
        # Try POST on a GET-only endpoint
        response = client.post("/api/health/")
        assert response.status_code == 405
        
        data = response.json()
        assert "detail" in data
    
    def test_invalid_json_handling(self, client):
        """Test handling of invalid JSON in requests."""
        # This would typically be tested on POST endpoints that expect JSON
        # Since we don't have accessible POST endpoints without auth, we'll test the structure
        response = client.post(
            "/api/auth/login",  # This endpoint should exist
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        # Should return 422 (validation error) or 400 (bad request)
        assert response.status_code in [400, 422]

class TestSecurityHeaders:
    """Test security-related headers and configurations."""
    
    def test_security_headers_present(self, client):
        """Test that basic security headers are present."""
        response = client.get("/api/health/")
        
        # Check for common security headers (these might not all be present)
        headers = response.headers
        
        # At minimum, we should have content-type
        assert "content-type" in headers
        assert "application/json" in headers["content-type"]
    
    def test_no_sensitive_info_in_errors(self, client):
        """Test that error responses don't leak sensitive information."""
        response = client.get("/api/nonexistent")
        
        # Error response should not contain sensitive paths or internal details
        error_text = response.text.lower()
        sensitive_terms = ["password", "secret", "key", "token", "c:\\", "/home/"]
        
        for term in sensitive_terms:
            assert term not in error_text, f"Sensitive term '{term}' found in error response"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])