@echo off
echo ========================================
echo         RenewMart Deployment Script
echo ========================================
echo.

echo [1/6] Checking Python virtual environment...
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)

echo [2/6] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/6] Installing/Updating backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo [4/6] Installing/Updating frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [5/6] Building frontend for production...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo [6/6] Running database setup...
cd ..\backend
python create_tables.py
if %errorlevel% neq 0 (
    echo WARNING: Database setup encountered issues
)

echo.
echo ========================================
echo     Deployment completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'start-application.bat' to start the servers
echo 2. Access the application at http://localhost:4028
echo 3. API documentation at http://localhost:8000/docs
echo.
pause