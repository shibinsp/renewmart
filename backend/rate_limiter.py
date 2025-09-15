from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import redis
from config import settings
import logging

logger = logging.getLogger(__name__)

# Redis connection for rate limiting storage
try:
    redis_client = redis.Redis(
        host=getattr(settings, 'REDIS_HOST', 'localhost'),
        port=getattr(settings, 'REDIS_PORT', 6379),
        db=getattr(settings, 'REDIS_DB', 0),
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    # Test connection
    redis_client.ping()
    logger.info("Redis connection established for rate limiting")
except Exception as e:
    logger.warning(f"Redis connection failed, falling back to in-memory storage: {e}")
    redis_client = None

# Rate limiter configuration
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=f"redis://{getattr(settings, 'REDIS_HOST', 'localhost')}:{getattr(settings, 'REDIS_PORT', 6379)}/{getattr(settings, 'REDIS_DB', 0)}" if redis_client else "memory://",
    default_limits=["1000/hour"]  # Global default limit
)

# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors"""
    response = JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "detail": "Rate limit exceeded. Too many requests.",
            "type": "rate_limit_error",
            "retry_after": exc.retry_after,
            "limit": str(exc.detail).split(" ")[0] if exc.detail else "unknown",
            "window": "per minute" if "minute" in str(exc.detail) else "per hour",
            "timestamp": request.state.__dict__.get('start_time', 0)
        },
        headers={
            "Retry-After": str(exc.retry_after),
            "X-RateLimit-Limit": str(exc.detail).split(" ")[0] if exc.detail else "unknown",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(exc.retry_after)
        }
    )
    
    # Log rate limit violation
    client_ip = get_remote_address(request)
    logger.warning(
        f"Rate limit exceeded for IP {client_ip} on {request.url.path}. "
        f"Limit: {exc.detail}, Retry after: {exc.retry_after}s"
    )
    
    return response

# Rate limiting decorators for different endpoint types
class RateLimits:
    """Rate limiting configurations for different endpoint types"""
    
    # Public endpoints - generous limits
    PUBLIC = "200/minute"  # Public endpoints like health checks
    
    # Authentication endpoints - more restrictive
    AUTH_LOGIN = "5/minute"  # 5 login attempts per minute
    AUTH_REGISTER = "3/minute"  # 3 registration attempts per minute
    AUTH_TOKEN_REFRESH = "10/minute"  # 10 token refresh per minute
    
    # General API endpoints
    API_READ = "100/minute"  # Read operations
    API_WRITE = "30/minute"  # Write operations
    API_DELETE = "10/minute"  # Delete operations
    
    # File upload endpoints
    FILE_UPLOAD = "5/minute"  # File uploads
    
    # Search and listing endpoints
    SEARCH = "50/minute"  # Search operations
    
    # Admin endpoints
    ADMIN = "20/minute"  # Admin operations

def get_client_identifier(request: Request) -> str:
    """Get client identifier for rate limiting
    
    Uses IP address as primary identifier, with fallback options
    for better identification in production environments.
    """
    # Try to get real IP from headers (for reverse proxy setups)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    return get_remote_address(request)

def create_rate_limiter_with_custom_key():
    """Create a rate limiter with custom key function"""
    return Limiter(
        key_func=get_client_identifier,
        storage_uri=f"redis://{getattr(settings, 'REDIS_HOST', 'localhost')}:{getattr(settings, 'REDIS_PORT', 6379)}/{getattr(settings, 'REDIS_DB', 0)}" if redis_client else "memory://",
        default_limits=["1000/hour"]
    )

# Enhanced limiter with custom key function
enhanced_limiter = create_rate_limiter_with_custom_key()

# Rate limiting middleware for specific routes
def apply_rate_limit(limit: str):
    """Decorator to apply rate limiting to specific routes
    
    Args:
        limit: Rate limit string (e.g., "5/minute", "100/hour")
    
    Returns:
        Decorator function
    """
    def decorator(func):
        return enhanced_limiter.limit(limit)(func)
    return decorator

# Health check for rate limiter
def check_rate_limiter_health() -> dict:
    """Check the health of the rate limiting system"""
    health_status = {
        "rate_limiter": "healthy",
        "storage": "memory" if not redis_client else "redis",
        "redis_connection": False
    }
    
    if redis_client:
        try:
            redis_client.ping()
            health_status["redis_connection"] = True
        except Exception as e:
            health_status["rate_limiter"] = "degraded"
            health_status["redis_connection"] = False
            health_status["error"] = str(e)
    
    return health_status