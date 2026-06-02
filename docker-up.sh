#!/bin/bash
# Quick start script for local Docker development

set -e

echo "🐳 LocalMart Docker Setup"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it: https://docker.com"
    exit 1
fi

echo "✓ Docker found"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✓ Docker Compose found"
echo ""

# Check .env file
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Creating template..."
    cat > backend/.env << 'EOF'
MONGO_URL="mongodb://root:mongodb@mongodb:27017"
DB_NAME="localmart"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
EOF
    echo "📝 Created backend/.env - update with your Cloudinary credentials"
fi

check_env=false
if grep -q "your_cloud_name" "backend/.env"; then
    echo "⚠️  Cloudinary credentials not set in .env"
    check_env=true
fi

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "✅ Containers started!"
echo ""
echo "📍 Access at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🛑 Stop everything:"
echo "   docker-compose down"
echo ""

if [ "$check_env" = true ]; then
    echo "⚠️  Don't forget to set Cloudinary credentials in backend/.env"
    echo "   Then restart: docker-compose restart backend"
fi
