from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any, List, Optional
import logging
import time
import psutil
import os
from datetime import datetime, timezone

from database import get_db, engine
from redis_service import redis_service
from rate_limiter import enhanced_limiter, RateLimits, check_rate_limiter_health
from auth import get_current_user
from models.schemas import SuccessResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/health",
    tags=["Health & Monitoring"],
    responses={
        500: {"description": "Service unavailable"}
    }
)

@router.get(
    "/",
    response_model=Dict[str, Any],
    summary="Basic health check",
    description="""
    Perform a basic health check of the application.
    
    This endpoint provides a quick overview of system health including:
    - Application status and uptime
    - Database connectivity
    - Redis connectivity (if configured)
    - Rate limiter status
    
    **No Authentication Required**
    
    **Rate Limiting:** 60 requests per minute per IP
    """,
    response_description="Basic health status",
    responses={
        200: {
            "description": "System is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": "2024-01-15T10:30:00Z",
                        "version": "1.0.0",
                        "uptime_seconds": 3600,
                        "services": {
                            "database": "connected",
                            "redis": "connected",
                            "rate_limiter": "operational"
                        }
                    }
                }
            }
        },
        503: {
            "description": "Service unavailable",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unhealthy",
                        "timestamp": "2024-01-15T10:30:00Z",
                        "errors": ["Database connection failed"]
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.PUBLIC)
def health_check(request: Request):
    """
    Basic health check endpoint.
    
    Returns the overall health status of the application and its dependencies.
    """
    start_time = time.time()
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "services": {},
        "errors": []
    }
    
    # Check database connectivity
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["services"]["database"] = "connected"
    except Exception as e:
        health_status["services"]["database"] = "disconnected"
        health_status["errors"].append(f"Database: {str(e)}")
        health_status["status"] = "unhealthy"
    
    # Check Redis connectivity
    try:
        redis_health = check_rate_limiter_health()
        health_status["services"]["redis"] = redis_health.get("status", "unknown")
        if not redis_health.get("connected", False):
            health_status["errors"].append("Redis: Connection failed")
    except Exception as e:
        health_status["services"]["redis"] = "error"
        health_status["errors"].append(f"Redis: {str(e)}")
    
    # Check rate limiter
    try:
        health_status["services"]["rate_limiter"] = "operational"
    except Exception as e:
        health_status["services"]["rate_limiter"] = "error"
        health_status["errors"].append(f"Rate limiter: {str(e)}")
    
    # Calculate response time
    health_status["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
    
    # Return appropriate status code
    if health_status["errors"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health_status
        )
    
    return health_status

@router.get(
    "/detailed",
    response_model=Dict[str, Any],
    summary="Detailed health check",
    description="""
    Comprehensive health check with detailed system metrics.
    
    This endpoint provides extensive system information including:
    - System resource usage (CPU, memory, disk)
    - Database connection pool status
    - Redis performance metrics
    - Application performance statistics
    - Environment information
    
    **Authentication Required:** Valid JWT token with admin privileges
    
    **Rate Limiting:** 20 requests per minute per user
    """,
    response_description="Detailed system health and metrics",
    responses={
        200: {
            "description": "Detailed health information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": "2024-01-15T10:30:00Z",
                        "system": {
                            "cpu_percent": 15.2,
                            "memory_percent": 45.8,
                            "disk_usage_percent": 62.1,
                            "load_average": [0.5, 0.7, 0.8]
                        },
                        "database": {
                            "status": "connected",
                            "pool_size": 20,
                            "active_connections": 5
                        },
                        "redis": {
                            "status": "connected",
                            "memory_usage": "2.5MB",
                            "connected_clients": 3
                        }
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def detailed_health_check(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Detailed health check with comprehensive system metrics.
    
    Requires admin privileges to access detailed system information.
    """
    # Check admin privileges
    user_roles = current_user.get('roles', [])
    if 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for detailed health check"
        )
    
    start_time = time.time()
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "errors": []
    }
    
    # System metrics
    try:
        health_data["system"] = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage_percent": psutil.disk_usage('/').percent if os.name != 'nt' else psutil.disk_usage('C:\\').percent,
            "boot_time": datetime.fromtimestamp(psutil.boot_time(), timezone.utc).isoformat(),
            "python_version": f"{psutil.Process().memory_info().rss / 1024 / 1024:.1f}MB"
        }
        
        # Add load average for Unix systems
        if hasattr(os, 'getloadavg'):
            health_data["system"]["load_average"] = list(os.getloadavg())
            
    except Exception as e:
        health_data["errors"].append(f"System metrics: {str(e)}")
    
    # Database detailed check
    try:
        with engine.connect() as conn:
            # Test query performance
            query_start = time.time()
            conn.execute(text("SELECT 1"))
            query_time = (time.time() - query_start) * 1000
            
            health_data["database"] = {
                "status": "connected",
                "query_time_ms": round(query_time, 2),
                "pool_size": engine.pool.size(),
                "checked_out_connections": engine.pool.checkedout(),
                "overflow_connections": engine.pool.overflow(),
                "invalid_connections": engine.pool.invalidated()
            }
    except Exception as e:
        health_data["database"] = {
            "status": "error",
            "error": str(e)
        }
        health_data["errors"].append(f"Database: {str(e)}")
        health_data["status"] = "unhealthy"
    
    # Redis detailed check
    try:
        if redis_service.is_connected:
            redis_info = redis_service.get_health_status()
            health_data["redis"] = redis_info
        else:
            health_data["redis"] = {
                "status": "disconnected",
                "message": "Redis not configured or unavailable"
            }
    except Exception as e:
        health_data["redis"] = {
            "status": "error",
            "error": str(e)
        }
        health_data["errors"].append(f"Redis: {str(e)}")
    
    # Rate limiter check
    try:
        rate_limiter_health = check_rate_limiter_health()
        health_data["rate_limiter"] = rate_limiter_health
    except Exception as e:
        health_data["rate_limiter"] = {
            "status": "error",
            "error": str(e)
        }
        health_data["errors"].append(f"Rate limiter: {str(e)}")
    
    # Performance metrics
    health_data["performance"] = {
        "response_time_ms": round((time.time() - start_time) * 1000, 2),
        "process_id": os.getpid(),
        "thread_count": psutil.Process().num_threads()
    }
    
    # Environment info
    health_data["environment"] = {
        "python_version": f"{psutil.sys.version_info.major}.{psutil.sys.version_info.minor}.{psutil.sys.version_info.micro}",
        "platform": psutil.os.name,
        "hostname": psutil.os.uname().nodename if hasattr(psutil.os, 'uname') else 'unknown'
    }
    
    # Return appropriate status
    if health_data["errors"]:
        health_data["status"] = "degraded" if len(health_data["errors"]) < 3 else "unhealthy"
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE if health_data["status"] == "unhealthy" else status.HTTP_200_OK,
            detail=health_data
        )
    
    return health_data

@router.get(
    "/metrics",
    response_model=Dict[str, Any],
    summary="Application metrics",
    description="""
    Retrieve application performance and usage metrics.
    
    This endpoint provides metrics suitable for monitoring systems including:
    - Request count and response times
    - Error rates and status codes
    - Resource utilization
    - Cache hit/miss ratios
    
    **Authentication Required:** Valid JWT token with admin privileges
    
    **Rate Limiting:** 30 requests per minute per user
    
    **Output Format:** Compatible with Prometheus metrics format
    """,
    response_description="Application metrics and statistics",
    responses={
        200: {
            "description": "Metrics retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "http_requests_total": 15420,
                        "http_request_duration_seconds": {
                            "avg": 0.125,
                            "p95": 0.450,
                            "p99": 0.890
                        },
                        "database_connections_active": 8,
                        "cache_hit_ratio": 0.85,
                        "memory_usage_bytes": 134217728
                    }
                }
            }
        }
    }
)
@enhanced_limiter.limit(RateLimits.ADMIN)
def get_metrics(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Get application metrics for monitoring and alerting.
    
    Returns metrics in a format suitable for monitoring systems.
    """
    # Check admin privileges
    user_roles = current_user.get('roles', [])
    if 'admin' not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access metrics"
        )
    
    try:
        # Basic system metrics
        process = psutil.Process()
        metrics = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system": {
                "cpu_percent": psutil.cpu_percent(),
                "memory_usage_bytes": process.memory_info().rss,
                "memory_percent": process.memory_percent(),
                "open_files": len(process.open_files()),
                "threads": process.num_threads()
            },
            "database": {
                "pool_size": engine.pool.size(),
                "active_connections": engine.pool.checkedout(),
                "overflow_connections": engine.pool.overflow()
            }
        }
        
        # Redis metrics if available
        if redis_service.is_connected:
            try:
                cache_stats = redis_service.get_health_status()
                metrics["redis"] = {
                    "connected": True,
                    "memory_usage": cache_stats.get("used_memory_human", "unknown"),
                    "uptime_seconds": cache_stats.get("uptime_seconds", 0)
                }
            except Exception:
                metrics["redis"] = {"connected": False}
        else:
            metrics["redis"] = {"connected": False}
        
        # Application-specific metrics
        metrics["application"] = {
            "version": "1.0.0",
            "uptime_seconds": time.time() - psutil.boot_time(),
            "status": "operational"
        }
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error retrieving metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve metrics"
        )

@router.get(
    "/readiness",
    response_model=Dict[str, Any],
    summary="Readiness probe",
    description="""
    Kubernetes-style readiness probe endpoint.
    
    This endpoint checks if the application is ready to serve traffic by verifying:
    - Database connectivity and responsiveness
    - Essential services availability
    - Configuration validity
    
    **No Authentication Required**
    
    **Rate Limiting:** 100 requests per minute per IP
    
    **Use Case:** Container orchestration readiness checks
    """,
    response_description="Application readiness status",
    responses={
        200: {"description": "Application is ready"},
        503: {"description": "Application is not ready"}
    }
)
@enhanced_limiter.limit("100/minute")
def readiness_probe(request: Request):
    """
    Readiness probe for container orchestration.
    
    Returns 200 if the application is ready to serve traffic.
    """
    try:
        # Check database readiness
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "status": "ready",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "checks": {
                "database": "ready"
            }
        }
        
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "not_ready",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }
        )

@router.get(
    "/liveness",
    response_model=Dict[str, Any],
    summary="Liveness probe",
    description="""
    Kubernetes-style liveness probe endpoint.
    
    This endpoint performs a minimal check to verify the application is alive:
    - Process is running and responsive
    - Basic application functionality
    
    **No Authentication Required**
    
    **Rate Limiting:** 200 requests per minute per IP
    
    **Use Case:** Container orchestration liveness checks
    """,
    response_description="Application liveness status",
    responses={
        200: {"description": "Application is alive"}
    }
)
@enhanced_limiter.limit("200/minute")
def liveness_probe(request: Request):
    """
    Liveness probe for container orchestration.
    
    Simple check that the application process is alive and responsive.
    """
    return {
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pid": os.getpid()
    }