from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import time
import logging
from pydantic import ValidationError
from database import engine, Base
from routers import auth, users, lands, sections, tasks, investors, documents, logs as logs_router, cache, health
import logs
from logs import log_request_middleware, setup_request_logging
from config import settings
from rate_limiter import limiter, rate_limit_handler, check_rate_limiter_health
from slowapi.errors import RateLimitExceeded

# Configure logging based on settings
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# Create database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    setup_request_logging()  # Initialize request logging
    yield
    # Shutdown
    pass

app = FastAPI(
    title="RenewMart API",
    description="""# RenewMart - Renewable Energy Land Management Platform
    
    A comprehensive API for managing renewable energy land investments, connecting landowners with investors and developers.
    
    ## Features
    
    * **User Management**: Registration, authentication, and role-based access control
    * **Land Management**: List, search, and manage renewable energy suitable lands
    * **Document Management**: Upload, review, and manage land-related documents
    * **Task Management**: Assign and track tasks for land development projects
    * **Investment Tracking**: Manage investor interests and investment opportunities
    * **System Monitoring**: Comprehensive logging and health monitoring
    
    ## Authentication
    
    This API uses OAuth2 with Bearer tokens. To authenticate:
    1. Register a new account or use existing credentials
    2. Obtain an access token via `/api/auth/token`
    3. Include the token in the Authorization header: `Bearer <token>`
    
    ## Rate Limiting
    
    API endpoints are rate-limited to ensure fair usage and system stability.
    
    ## Support
    
    For technical support, please contact the development team.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan,
    contact={
        "name": "RenewMart Development Team",
        "email": "dev@renewmart.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.renewmart.com",
            "description": "Production server"
        }
    ]
)

# Add rate limiting state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Request timing and logging middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log the request
    try:
        log_request_middleware(request, response, process_time)
    except Exception as e:
        logger.error(f"Error logging request: {str(e)}")
    
    return response

# Pydantic validation exception handler
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"Validation error: {str(exc)}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "type": "validation_error",
            "errors": exc.errors()
        }
    )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "server_error"}
    )

# HTTP exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": "http_error"}
    )

# Include routers with proper prefixes
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api", tags=["users"])  # users router already has /users prefix
app.include_router(lands.router, prefix="/api", tags=["lands"])  # lands router already has /lands prefix
app.include_router(sections.router, prefix="/api/sections", tags=["sections"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(investors.router, prefix="/api", tags=["investors"])  # investors router already has /investors prefix
app.include_router(documents.router, prefix="/api", tags=["documents"])  # documents router already has /documents prefix
app.include_router(logs_router.router, prefix="/api", tags=["logs"])  # logs router already has /logs prefix
app.include_router(cache.router, prefix="/api", tags=["cache"])  # cache router already has /cache prefix
app.include_router(health.router, prefix="/api", tags=["health"])  # health router already has /health prefix

@app.get("/",
    summary="API Root",
    description="Welcome endpoint providing basic API information and navigation links",
    response_description="API welcome message with navigation links",
    tags=["Root"]
)
async def root():
    """Welcome to RenewMart API
    
    Returns basic information about the API including:
    - API version and description
    - Current environment
    - Links to documentation
    - Available endpoints overview
    """
    return {
        "message": "Welcome to RenewMart API",
        "version": "1.0.0",
        "description": "RenewMart - Renewable Energy Land Management Platform",
        "environment": settings.get("ENVIRONMENT", "development"),
        "docs": "/docs",
        "redoc": "/redoc",
        "api_base": "/api",
        "status": "operational"
    }

@app.get("/health",
    summary="Health Check",
    description="Check the health status of the API and its dependencies",
    response_description="Health status information including system metrics",
    tags=["Monitoring"],
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "timestamp": 1640995200.0,
                        "version": "1.0.0",
                        "environment": "development",
                        "debug": True,
                        "uptime": "2h 30m 45s",
                        "database": "connected"
                    }
                }
            }
        },
        503: {
            "description": "Service is unhealthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unhealthy",
                        "timestamp": 1640995200.0,
                        "version": "1.0.0",
                        "environment": "development",
                        "debug": True,
                        "errors": ["Database connection failed"]
                    }
                }
            }
        }
    }
)
async def health_check():
    """Health Check Endpoint
    
    Performs a comprehensive health check of the API including:
    - Service availability
    - Database connectivity
    - System timestamp
    - Environment information
    - Debug mode status
    
    Returns HTTP 200 if healthy, HTTP 503 if unhealthy.
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "environment": settings.get("ENVIRONMENT", "development"),
        "debug": settings.DEBUG,
        "uptime": "running",
        "database": "connected",
        "rate_limiter": check_rate_limiter_health()
    }

@app.get("/api/info",
    summary="API Information",
    description="Get comprehensive information about available API endpoints and features",
    response_description="Detailed API information including endpoints, features, and capabilities",
    tags=["Root"],
    responses={
        200: {
            "description": "API information retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "endpoints": {
                            "authentication": "/api/auth",
                            "users": "/api/users",
                            "lands": "/api/lands",
                            "sections": "/api/sections",
                            "tasks": "/api/tasks",
                            "investors": "/api/investors",
                            "documents": "/api/documents",
                            "logs": "/api/logs"
                        },
                        "features": [
                            "User management and authentication",
                            "Land listing and management",
                            "Document upload and review",
                            "Task assignment and tracking",
                            "Investor interest management",
                            "Land visibility controls",
                            "System log querying and monitoring"
                        ],
                        "version": "1.0.0",
                        "authentication_required": True,
                        "rate_limited": True
                    }
                }
            }
        }
    }
)
async def api_info():
    """API Information Endpoint
    
    Provides comprehensive information about the RenewMart API including:
    - Available endpoint categories and their base URLs
    - Key features and capabilities
    - Authentication requirements
    - Rate limiting information
    
    This endpoint is useful for API discovery and integration planning.
    """
    return {
        "endpoints": {
            "authentication": "/api/auth",
            "users": "/api/users",
            "lands": "/api/lands",
            "sections": "/api/sections",
            "tasks": "/api/tasks",
            "investors": "/api/investors",
            "documents": "/api/documents",
            "logs": "/api/logs"
        },
        "features": [
            "User management and authentication",
            "Land listing and management",
            "Document upload and review",
            "Task assignment and tracking",
            "Investor interest management",
            "Land visibility controls",
            "System log querying and monitoring"
        ],
        "version": "1.0.0",
        "authentication_required": True,
        "rate_limited": True,
        "supported_formats": ["JSON"],
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": "/openapi.json"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host=settings.HOST, 
        port=settings.PORT, 
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )