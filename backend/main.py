from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from database import engine, Base
from routers import auth, users, lands, sections, tasks, investors, documents

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4028", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(lands.router, prefix="/api/lands", tags=["lands"])
app.include_router(sections.router, prefix="/api/sections", tags=["sections"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(investors.router, prefix="/api/investors", tags=["investors"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])

@app.get("/")
async def root():
    return {"message": "Welcome to RenewMart API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)