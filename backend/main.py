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
from routers import auth, users, lands, sections, tasks, investors, documents, logs as logs_router
import logs
from logs import log_request_middleware, setup_request_logging
from settings import get_settings


# Get application settings
settings = get_settings()

# Configure logging based on settings
logging.basicConfig(
    level=getattr(logging, settings.logging.level),
    format=settings.logging.format
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
    title=settings.api.title,
    description=settings.api.description,
    version=settings.api.version,
    docs_url=settings.api.docs_url,
    redoc_url=settings.api.redoc_url,
    openapi_url=settings.api.openapi_url,
    debug=settings.debug,
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.security.allowed_hosts
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.allow_origins,
    allow_credentials=settings.cors.allow_credentials,
    allow_methods=settings.cors.allow_methods,
    allow_headers=settings.cors.allow_headers,
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

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.api.title}",
        "version": settings.api.version,
        "description": settings.api.description,
        "environment": settings.environment,
        "docs": settings.api.docs_url,
        "redoc": settings.api.redoc_url
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.api.version,
        "environment": settings.environment,
        "debug": settings.debug
    }

@app.get("/api/info")
async def api_info():
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
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host=settings.server.host, 
        port=settings.server.port, 
        reload=settings.server.reload,
        log_level=settings.logging.level.lower()
    )