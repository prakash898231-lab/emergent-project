@echo off

echo [1/3] Checking for Node.js and npm...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js (which includes npm) from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Installing/Updating frontend dependencies (if necessary)...
if not exist node_modules (
    npm install
)

echo [3/3] Starting Frontend Development Server on port 3000...
SET REACT_APP_BACKEND_URL=http://localhost:8000
npm start