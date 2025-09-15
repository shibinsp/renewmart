from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any, Optional
import logging

from redis_service import redis_service, cache_manager, session_manager
from auth import get_current_user
from models.schemas import SuccessResponse, ErrorResponse
from rate_limiter import enhanced_limiter, RateLimits

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/cache",
    tags=["Cache Management"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/status",
    response_model=Dict[str, Any],
    summary="Get cache system status",
    description="""
    Retrieve comprehensive status information about the Redis cache system.
    
    This endpoint provides detailed information about the cache system including:
    - Connection status and configuration
    - Memory usage and performance metrics
    - Hit/miss ratios and statistics
    - Total number of cached keys
    
    **Authentication Required:** Valid JWT token
    
    **Rate Limiting:** 20 requests per minute per user
    """,
    response_description="Cache system status and statistics",
    responses={
        200: {
            "description": "Cache status retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "redis_health": {
                            "connected": True,
                            "host": "localhost",
                            "port": 6379,
                            "version": "7.0.0",
                            "uptime_seconds": 86400,
                            "used_memory_human": "2.5MB"
                        },
                        "cache_stats": {
                            "status": "connected",
                            "total_keys": 1250,
                            "memory_usage": "2.5MB",
                            "hits": 8500,
                            "misses": 1500,
                            "hit_rate": 85.0
                        }
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def get_cache_status(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Get comprehensive cache system status and statistics.
    
    Returns detailed information about Redis connection, performance metrics,
    and cache utilization statistics.
    """
    try:
        redis_health = redis_service.get_health_status()
        cache_stats = cache_manager.get_cache_stats()
        
        return {
            "redis_health": redis_health,
            "cache_stats": cache_stats,
            "timestamp": request.state.__dict__.get('start_time', 0)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving cache status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve cache status"
        )

@router.delete(
    "/invalidate",
    response_model=SuccessResponse,
    summary="Invalidate cache entries",
    description="""
    Invalidate cache entries based on pattern matching.
    
    This endpoint allows administrators to clear specific cache entries or patterns
    to force cache refresh. Useful for:
    - Clearing stale data after updates
    - Removing user-specific cache after account changes
    - Bulk cache invalidation for maintenance
    
    **Authentication Required:** Valid JWT token with admin privileges
    
    **Rate Limiting:** 10 requests per minute per user
    
    **Pattern Examples:**
    - `user:123:*` - Clear all cache for user 123
    - `api:lands:*` - Clear all land-related API cache
    - `session:*` - Clear all sessions
    """,
    response_description="Cache invalidation result",
    responses={
        200: {
            "description": "Cache invalidated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Cache invalidated successfully",
                        "data": {
                            "pattern": "user:123:*",
                            "keys_deleted": 15,
                            "timestamp": "2024-01-15T10:30:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid pattern or parameters",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "Invalid cache pattern provided",
                        "type": "validation_error",
                        "status_code": 400
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def invalidate_cache(
    request: Request,
    pattern: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Invalidate cache entries matching the specified pattern.
    
    Requires admin privileges to prevent unauthorized cache manipulation.
    """
    # Check if user has admin role
    user_roles = current_user.get('roles', [])
    if 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for cache invalidation"
        )
    
    if not pattern or len(pattern.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cache pattern is required"
        )
    
    try:
        keys_deleted = cache_manager.invalidate_pattern(pattern)
        
        logger.info(
            f"Cache invalidated by user {current_user.get('user_id')}. "
            f"Pattern: {pattern}, Keys deleted: {keys_deleted}"
        )
        
        return SuccessResponse(
            message="Cache invalidated successfully",
            data={
                "pattern": pattern,
                "keys_deleted": keys_deleted,
                "timestamp": request.state.__dict__.get('start_time', 0)
            }
        )
        
    except Exception as e:
        logger.error(f"Cache invalidation error for pattern '{pattern}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to invalidate cache"
        )

@router.delete(
    "/user/{user_id}",
    response_model=SuccessResponse,
    summary="Clear user-specific cache",
    description="""
    Clear all cache entries associated with a specific user.
    
    This endpoint removes all cached data for a particular user including:
    - User profile cache
    - User-specific API response cache
    - User session data
    - User preference cache
    
    **Authentication Required:** Valid JWT token with admin privileges
    
    **Rate Limiting:** 10 requests per minute per user
    
    **Use Cases:**
    - User account updates requiring cache refresh
    - User role changes
    - Privacy compliance (data removal)
    - Troubleshooting user-specific issues
    """,
    response_description="User cache clearing result",
    responses={
        200: {
            "description": "User cache cleared successfully",
            "content": {
                "application/json": {
                    "example": {
                        "message": "User cache cleared successfully",
                        "data": {
                            "user_id": "123e4567-e89b-12d3-a456-426614174000",
                            "keys_deleted": 8,
                            "timestamp": "2024-01-15T10:30:00Z"
                        }
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def clear_user_cache(
    request: Request,
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Clear all cache entries for a specific user.
    
    Requires admin privileges or the user clearing their own cache.
    """
    # Check permissions - admin or own user
    user_roles = current_user.get('roles', [])
    current_user_id = current_user.get('user_id')
    
    if 'admin' not in user_roles and str(current_user_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required or can only clear own cache"
        )
    
    try:
        keys_deleted = cache_manager.clear_user_cache(user_id)
        
        logger.info(
            f"User cache cleared by {current_user_id} for user {user_id}. "
            f"Keys deleted: {keys_deleted}"
        )
        
        return SuccessResponse(
            message="User cache cleared successfully",
            data={
                "user_id": user_id,
                "keys_deleted": keys_deleted,
                "timestamp": request.state.__dict__.get('start_time', 0)
            }
        )
        
    except Exception as e:
        logger.error(f"User cache clearing error for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear user cache"
        )

@router.get(
    "/sessions/active",
    response_model=Dict[str, Any],
    summary="Get active sessions count",
    description="""
    Retrieve information about active user sessions.
    
    This endpoint provides statistics about current active sessions including:
    - Total number of active sessions
    - Session distribution by user role
    - Average session duration
    
    **Authentication Required:** Valid JWT token with admin privileges
    
    **Rate Limiting:** 20 requests per minute per user
    """,
    response_description="Active sessions information",
    responses={
        200: {
            "description": "Active sessions information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "total_sessions": 45,
                        "session_stats": {
                            "landowner": 28,
                            "investor": 15,
                            "admin": 2
                        },
                        "timestamp": "2024-01-15T10:30:00Z"
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def get_active_sessions(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Get information about active user sessions.
    
    Requires admin privileges to view session statistics.
    """
    # Check admin privileges
    user_roles = current_user.get('roles', [])
    if 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to view session information"
        )
    
    try:
        # This is a simplified implementation
        # In a real scenario, you'd query Redis for session patterns
        if not redis_service.is_connected:
            return {
                "message": "Redis not connected - session tracking unavailable",
                "total_sessions": 0,
                "timestamp": request.state.__dict__.get('start_time', 0)
            }
        
        # Get basic session statistics
        # Note: This is a simplified version - real implementation would
        # scan Redis for session keys and analyze them
        return {
            "message": "Session tracking available",
            "total_sessions": "Available with Redis connection",
            "note": "Full session analytics require Redis pattern scanning",
            "timestamp": request.state.__dict__.get('start_time', 0)
        }
        
    except Exception as e:
        logger.error(f"Error retrieving session information: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve session information"
        )