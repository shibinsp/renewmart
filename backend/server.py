#!/usr/bin/env python3
"""
RenewMart Server Startup Script

This script provides a centralized way to start the RenewMart FastAPI server
with proper configuration, logging, and error handling.
"""

import os
import sys
import signal
import uvicorn
import argparse
from pathlib import Path
from fastapi import FastAPI, HTTPException
from http import HTTPStatus
from pydantic import ValidationError
import logs #### Dummy Database

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from logs import setup_logging, get_logger
from settings import get_settings, Settings

# Global variables
server = None
logger = None

def signal_handler(signum, frame):
    """
    Handle shutdown signals gracefully.
    
    Args:
        signum: Signal number
        frame: Current stack frame
    """
    global server, logger
    
    if logger:
        logger.info(f"Received signal {signum}, shutting down gracefully...")
    
    if server:
        server.should_exit = True
    
    sys.exit(0)

def setup_environment():
    """
    Setup environment variables and configuration using Pydantic settings.
    """
    try:
        # Load settings to validate configuration
        settings = get_settings()
        
        # Set environment variables from settings if not already set
        env_mappings = {
            'ENVIRONMENT': settings.environment,
            'SERVER_HOST': settings.server.host,
            'SERVER_PORT': str(settings.server.port),
            'SERVER_RELOAD': str(settings.server.reload).lower(),
            'LOG_LEVEL': settings.logging.level.lower()
        }
        
        for key, value in env_mappings.items():
            if key not in os.environ:
                os.environ[key] = value
                
        return settings
        
    except ValidationError as e:
        print(f"Configuration validation error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error setting up environment: {e}")
        sys.exit(1)

def validate_environment():
    """
    Validate that all required environment variables and files exist.
    
    Returns:
        bool: True if environment is valid, False otherwise
    """
    global logger
    
    # Check if main.py exists
    main_file = Path(__file__).parent / "main.py"
    if not main_file.exists():
        if logger:
            logger.error(f"Main application file not found: {main_file}")
        else:
            print(f"ERROR: Main application file not found: {main_file}")
        return False
    
    # Check if database file exists (for SQLite)
    db_file = Path(__file__).parent / "renewmart.db"
    if not db_file.exists():
        if logger:
            logger.warning(f"Database file not found: {db_file}. Run create_tables.py first.")
        else:
            print(f"WARNING: Database file not found: {db_file}. Run create_tables.py first.")
    
    return True

def get_server_config(args, settings: Settings):
    """
    Get server configuration from arguments, settings, and environment variables.
    
    Args:
        args: Parsed command line arguments
        settings: Pydantic settings instance
    
    Returns:
        dict: Server configuration
    """
    config = {
        'app': 'main:app',
        'host': args.host or settings.server.host,
        'port': int(args.port or settings.server.port),
        'reload': args.reload if args.reload is not None else settings.server.reload,
        'log_level': args.log_level or settings.logging.level.lower(),
        'access_log': True,
        'use_colors': True,
        'workers': settings.server.workers if not settings.server.reload else 1
    }
    
    # Disable reload and colors in production
    if settings.environment == 'production':
        config['reload'] = False
        config['use_colors'] = False
    
    return config

def start_server(config, settings: Settings):
    """
    Start the FastAPI server with the given configuration.
    
    Args:
        config: Server configuration dictionary
        settings: Pydantic settings instance
    """
    global server, logger
    
    try:
        logger.info(f"Starting {settings.api.title} v{settings.api.version}...")
        logger.info(f"Environment: {settings.environment}")
        logger.info(f"Debug mode: {settings.debug}")
        logger.info(f"Server configuration: {config}")
        
        # Validate configuration
        try:
            server_config = uvicorn.Config(**config)
        except Exception as e:
            logger.error(f"Invalid server configuration: {str(e)}")
            raise
        
        server = uvicorn.Server(server_config)
        
        logger.info(f"Server starting on http://{config['host']}:{config['port']}")
        if settings.api.docs_url:
            logger.info(f"API documentation available at http://{config['host']}:{config['port']}{settings.api.docs_url}")
        if settings.api.redoc_url:
            logger.info(f"Alternative API docs at http://{config['host']}:{config['port']}{settings.api.redoc_url}")
        
        # Start the server
        server.run()
        
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except ValidationError as e:
        logger.error(f"Configuration validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Server startup failed: {str(e)}")
        raise
    finally:
        logger.info("Server shutdown complete")

def main():
    """
    Main entry point for the server script.
    """
    global logger
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='RenewMart FastAPI Server',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python server.py                          # Start with default settings
  python server.py --port 8080              # Start on port 8080
  python server.py --host 127.0.0.1         # Start on localhost only
  python server.py --no-reload              # Start without auto-reload
  python server.py --log-level debug        # Enable debug logging
        """
    )
    
    parser.add_argument(
        '--host',
        type=str,
        help='Host to bind the server to (default: 0.0.0.0)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        help='Port to bind the server to (default: 8000)'
    )
    
    parser.add_argument(
        '--reload',
        action='store_true',
        help='Enable auto-reload on code changes'
    )
    
    parser.add_argument(
        '--no-reload',
        dest='reload',
        action='store_false',
        help='Disable auto-reload'
    )
    
    parser.add_argument(
        '--log-level',
        choices=['debug', 'info', 'warning', 'error', 'critical'],
        help='Set the logging level (default: info)'
    )
    
    parser.add_argument(
        '--env',
        choices=['development', 'production'],
        help='Set the environment mode'
    )
    
    args = parser.parse_args()
    
    try:
        # Override environment if specified
        if args.env:
            os.environ['ENVIRONMENT'] = args.env
        
        # Setup environment and get settings
        settings = setup_environment()
        
        # Setup logging
        log_level_map = {
            'debug': 10,
            'info': 20,
            'warning': 30,
            'error': 40,
            'critical': 50
        }
        
        log_level = log_level_map.get(
            args.log_level or settings.logging.level.lower(),
            20
        )
        
        setup_logging(log_level)
        logger = get_logger('server')
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        logger.info(f"{settings.api.title} Server Starting...")
        logger.info(f"Environment: {settings.environment}")
        logger.info(f"Debug mode: {settings.debug}")
        logger.info(f"Python version: {sys.version}")
        logger.info(f"Working directory: {os.getcwd()}")
        
        # Validate environment
        if not validate_environment():
            logger.error("Environment validation failed")
            sys.exit(1)
        
        # Get server configuration
        config = get_server_config(args, settings)
        
        # Start the server
        start_server(config, settings)
        
    except KeyboardInterrupt:
        if logger:
            logger.info("Server startup interrupted by user")
        sys.exit(0)
    except Exception as e:
        if logger:
            logger.error(f"Server startup failed: {str(e)}")
        else:
            print(f"ERROR: Server startup failed: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()