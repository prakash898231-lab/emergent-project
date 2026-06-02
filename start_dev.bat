@echo off
SET PORT=8000
echo [1/4] Checking for processes on port %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Found process %%a using port %PORT%. Terminating...
    taskkill /F /PID %%a
)

echo [2/4] Installing/Updating backend dependencies...
pip install fastapi uvicorn motor cloudinary python-multipart python-dotenv passlib[bcrypt] pyjwt pydantic[email] requests pymongo

echo [3/4] Starting Frontend Server...
start cmd /k "cd frontend && call start_frontend.bat"

echo [3/4] Opening browser preview at http://localhost:3000
start "" "http://localhost:3000"

echo [4/4] Starting Backend Server on port %PORT%...
echo To use a different port, run: set PORT=8002 ^&^& python backend/server.py
python -m uvicorn backend.server:app --host 0.0.0.0 --port %PORT% --reload

pause