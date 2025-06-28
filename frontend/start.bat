@echo off
REM Lip Coding Frontend Startup Script for Windows

echo 🚀 Starting Lip Coding Frontend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% lss 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node -v
    echo    Please update Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v
echo ✅ npm detected
npm -v

REM Navigate to script directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Check if backend is running
echo 🔍 Checking if backend is running...
curl -s http://localhost:8080/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Backend is not running on http://localhost:8080
    echo    Please make sure the backend server is started first
    echo    The frontend will still start, but API calls will fail
    echo.
    set /p "choice=   Continue anyway? (y/N): "
    if /i not "%choice%"=="y" (
        echo ❌ Startup cancelled
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend is running on http://localhost:8080
)

echo.
echo 🌟 Starting development server...
echo    Frontend will be available at: http://localhost:3000
echo    Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev

pause