from pydantic import BaseSettings, Field, validator
from typing import List, Optional
import os
from pathlib import Path


class DatabaseSettings(BaseSettings):
    """Database configuration settings."""
    
    url: str = Field(
        default="sqlite:///./renewmart.db",
        description="Database connection URL"
    )
    echo: bool = Field(
        default=False,
        description="Enable SQLAlchemy query logging"
    )
    pool_size: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Database connection pool size"
    )
    max_overflow: int = Field(
        default=20,
        ge=0,
        le=100,
        description="Maximum overflow connections"
    )
    
    class Config:
        env_prefix = "DB_"
        case_sensitive = False


class ServerSettings(BaseSettings):
    """Server configuration settings."""
    
    host: str = Field(
        default="0.0.0.0",
        description="Server host address"
    )
    port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port number"
    )
    reload: bool = Field(
        default=True,
        description="Enable auto-reload in development"
    )
    workers: int = Field(
        default=1,
        ge=1,
        le=10,
        description="Number of worker processes"
    )
    
    @validator('reload')
    def validate_reload(cls, v, values):
        # Disable reload in production
        if os.getenv('ENVIRONMENT', 'development').lower() == 'production':
            return False
        return v
    
    class Config:
        env_prefix = "SERVER_"
        case_sensitive = False


class SecuritySettings(BaseSettings):
    """Security and authentication settings."""
    
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        min_length=32,
        description="JWT secret key"
    )
    algorithm: str = Field(
        default="HS256",
        description="JWT algorithm"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        ge=1,
        le=10080,  # 1 week
        description="Access token expiration time in minutes"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        ge=1,
        le=30,
        description="Refresh token expiration time in days"
    )
    allowed_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1", "0.0.0.0"],
        description="List of allowed hosts"
    )
    
    @validator('secret_key')
    def validate_secret_key(cls, v):
        if v == "your-secret-key-change-in-production":
            if os.getenv('ENVIRONMENT', 'development').lower() == 'production':
                raise ValueError("Must set a secure secret key in production")
        return v
    
    class Config:
        env_prefix = "SECURITY_"
        case_sensitive = False


class CORSSettings(BaseSettings):
    """CORS configuration settings."""
    
    allow_origins: List[str] = Field(
        default=[
            "http://localhost:4028",
            "http://localhost:3000",
            "http://127.0.0.1:4028",
            "http://127.0.0.1:3000"
        ],
        description="List of allowed origins for CORS"
    )
    allow_credentials: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    allow_methods: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        description="List of allowed HTTP methods"
    )
    allow_headers: List[str] = Field(
        default=["*"],
        description="List of allowed headers"
    )
    
    class Config:
        env_prefix = "CORS_"
        case_sensitive = False


class LoggingSettings(BaseSettings):
    """Logging configuration settings."""
    
    level: str = Field(
        default="INFO",
        regex=r"^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$",
        description="Logging level"
    )
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log message format"
    )
    file_enabled: bool = Field(
        default=True,
        description="Enable file logging"
    )
    file_path: str = Field(
        default="logs/app.log",
        description="Log file path"
    )
    max_file_size_mb: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Maximum log file size in MB"
    )
    backup_count: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of backup log files to keep"
    )
    
    class Config:
        env_prefix = "LOG_"
        case_sensitive = False


class APISettings(BaseSettings):
    """API configuration settings."""
    
    title: str = Field(
        default="RenewMart API",
        description="API title"
    )
    description: str = Field(
        default="Backend API for RenewMart - Renewable Energy Land Marketplace",
        description="API description"
    )
    version: str = Field(
        default="1.0.0",
        regex=r"^\d+\.\d+\.\d+$",
        description="API version"
    )
    docs_url: Optional[str] = Field(
        default="/docs",
        description="Swagger UI documentation URL"
    )
    redoc_url: Optional[str] = Field(
        default="/redoc",
        description="ReDoc documentation URL"
    )
    openapi_url: Optional[str] = Field(
        default="/openapi.json",
        description="OpenAPI schema URL"
    )
    
    class Config:
        env_prefix = "API_"
        case_sensitive = False


class Settings(BaseSettings):
    """Main application settings."""
    
    environment: str = Field(
        default="development",
        regex=r"^(development|production|testing)$",
        description="Application environment"
    )
    debug: bool = Field(
        default=True,
        description="Enable debug mode"
    )
    
    # Sub-settings
    database: DatabaseSettings = DatabaseSettings()
    server: ServerSettings = ServerSettings()
    security: SecuritySettings = SecuritySettings()
    cors: CORSSettings = CORSSettings()
    logging: LoggingSettings = LoggingSettings()
    api: APISettings = APISettings()
    
    @validator('debug')
    def validate_debug(cls, v, values):
        # Disable debug in production
        if values.get('environment') == 'production':
            return False
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        @classmethod
        def customise_sources(
            cls,
            init_settings,
            env_settings,
            file_secret_settings,
        ):
            return (
                init_settings,
                env_settings,
                file_secret_settings,
            )


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the global settings instance."""
    return settings


def reload_settings() -> Settings:
    """Reload settings from environment and files."""
    global settings
    settings = Settings()
    return settings