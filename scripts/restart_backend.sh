#!/bin/bash
echo "🔄 Reiniciando backend..."

# Parar backend
docker-compose stop backend

# Rebuildar backend
docker-compose build backend

# Iniciar backend con logs
docker-compose up -d backend

# Esperar a que inicie
sleep 10

# Verificar salud
echo "🏥 Verificando salud del backend..."
curl -f http://localhost:8000/health && echo " ✅ Backend OK" || echo " ❌ Backend Error"

# Verificar endpoint específico
echo "🔍 Verificando endpoint de iglesias..."
curl -f http://localhost:8000/api/v1/churches/health && echo " ✅ Churches endpoint OK" || echo " ❌ Churches endpoint Error"

# Mostrar logs
echo "📋 Últimos logs del backend:"
docker-compose logs --tail=20 backend
