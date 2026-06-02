@echo off
REM Quick start script for local Docker development (Windows)

echo.
echo 🐳 LocalMart Docker Setup
echo ==========================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install it: https://docker.com
    pause
    exit /b 1
)
echo ✓ Docker found

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)
echo ✓ Docker Compose found
echo.

REM Check .env file
if not exist "backend\.env" (
    echo ⚠️  backend\.env not found. Creating template...
    (
        echo MONGO_URL="mongodb://root:mongodb@mongodb:27017"
        echo DB_NAME="localmart"
        echo CORS_ORIGINS="*"
        echo JWT_SECRET="your-secret-key-change-in-production"
        echo CLOUDINARY_CLOUD_NAME="your_cloud_name"
        echo CLOUDINARY_API_KEY="your_api_key"
        echo CLOUDINARY_API_SECRET="your_api_secret"
    ) > backend\.env
    echo 📝 Created backend\.env - update with your Cloudinary credentials
)

echo.
echo 🚀 Starting containers...
docker-compose up -d

echo.
echo ✅ Containers started!
echo.
echo 📍 Access at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 📊 View logs:
echo    docker-compose logs -f backend
echo    docker-compose logs -f frontend
echo.
echo 🛑 Stop everything:
echo    docker-compose down
echo.

findstr "your_cloud_name" backend\.env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Don't forget to set Cloudinary credentials in backend\.env
    echo    Then restart: docker-compose restart backend
)

pause
