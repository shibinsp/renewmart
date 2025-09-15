@echo off
echo ========================================
echo      RenewMart Application Launcher
echo ========================================
echo.

echo Starting RenewMart application...
echo This will open two terminal windows:
echo 1. Backend API Server (Port 8000)
echo 2. Frontend Development Server (Port 4028)
echo.

echo [1/3] Activating Python virtual environment...
if not exist ".venv" (
    echo ERROR: Virtual environment not found!
    echo Please run 'deploy.bat' first to set up the environment.
    pause
    exit /b 1
)

echo [2/3] Starting Backend API Server...
start "RenewMart Backend" cmd /k "cd /d %~dp0backend && call ../.venv/Scripts/activate.bat && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Development Server...
start "RenewMart Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo        Application Started Successfully!
echo ========================================
echo.
echo Access Points:
echo - Frontend: http://localhost:4028
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
echo Demo Credentials:
echo - Landowner: john@example.com / password123
echo - Investor: jane@example.com / password123
echo - Admin: admin@renewmart.com / admin123
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://localhost:4028

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause