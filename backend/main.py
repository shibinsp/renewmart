from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import time
import logging
from database import engine, Base
from routers import auth, users, lands, sections, tasks, investors, documents

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="RenewMart API",
    description="Backend API for RenewMart - Renewable Energy Land Marketplace",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4028", 
        "http://localhost:3000",
        "http://127.0.0.1:4028",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

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

@app.get("/")
async def root():
    return {
        "message": "Welcome to RenewMart API",
        "version": "1.0.0",
        "description": "Backend API for RenewMart - Renewable Energy Land Marketplace",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
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
            "documents": "/api/documents"
        },
        "features": [
            "User management and authentication",
            "Land listing and management",
            "Document upload and review",
            "Task assignment and tracking",
            "Investor interest management",
            "Land visibility controls"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)