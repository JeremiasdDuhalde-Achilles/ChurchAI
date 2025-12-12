#!/bin/bash
echo "🚀 Starting ChurchAI..."

# Build and start all services
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🏥 Checking health..."
curl -f http://localhost:8000/health && echo " ✅ Backend OK" || echo " ❌ Backend Failed"
curl -f http://localhost:3000 && echo " ✅ Frontend OK" || echo " ❌ Frontend Failed"

echo ""
echo "✅ ChurchAI is running!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "🔍 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
