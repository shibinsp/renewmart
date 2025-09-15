from dynaconf import Dynaconf
from pathlib import Path
import os

# Initialize Dynaconf
settings = Dynaconf(
    envvar_prefix="RENEWMART",
    settings_files=['settings.toml', '.secrets.toml'],
    environments=True,
    load_dotenv=True,
    env_switcher="RENEWMART_ENV",
    merge_enabled=True,
)

# Helper functions for backward compatibility
def get_database_url() -> str:
    """Get the complete database URL"""
    return settings.DATABASE_URL

def get_log_dir() -> Path:
    """Get the log directory path"""
    log_file_path = Path(settings.LOG_FILE)
    return log_file_path.parent

def ensure_directories():
    """Ensure required directories exist"""
    # Create logs directory
    log_dir = get_log_dir()
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create upload directory
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Create documents subdirectory
    documents_path = upload_path / "documents"
    documents_path.mkdir(parents=True, exist_ok=True)

# Convenience functions
def get_settings():
    """Get application settings instance"""
    return settings

def is_development() -> bool:
    """Check if running in development environment"""
    return settings.get('ENVIRONMENT', 'development') == "development"

def is_production() -> bool:
    """Check if running in production environment"""
    return settings.get('ENVIRONMENT', 'development') == "production"

# Ensure directories exist on import
ensure_directories()