#!/bin/bash
echo "🔍 Debugging 404 Error..."

echo "1. Verificando que el backend esté corriendo:"
curl -i http://localhost:8000/health

echo -e "\n2. Verificando rutas disponibles:"
curl -i http://localhost:8000/

echo -e "\n3. Verificando endpoint de iglesias:"
curl -i http://localhost:8000/api/v1/churches/health

echo -e "\n4. Verificando documentación API:"
curl -i http://localhost:8000/docs

echo -e "\n5. Logs del backend:"
docker-compose logs --tail=30 backend

echo -e "\n6. Estructura de archivos del backend:"
docker-compose exec backend find /app -name "*.py" -type f

echo -e "\n7. Testing endpoint de registro:"
curl -X POST http://localhost:8000/api/v1/churches/register \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -i
