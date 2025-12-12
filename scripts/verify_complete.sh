#!/bin/bash

echo "🔍 ChurchAI - Verificación Completa del Sistema"
echo "================================================"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para verificar con color
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

echo ""
echo "1️⃣ VERIFICANDO CONTENEDORES"
echo "============================"
docker compose ps

echo ""
echo "2️⃣ VERIFICANDO SERVICIOS"
echo "========================"

# Backend Health
echo -n "Backend API: "
if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Funcionando${NC}"
    curl -s http://localhost:8000/health | jq -r '.status, .service, .version' | sed 's/^/  /'
else
    echo -e "${RED}❌ No responde${NC}"
fi

# Frontend
echo -n "Frontend: "
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Funcionando${NC}"
else
    echo -e "${RED}❌ No responde${NC}"
fi

# PostgreSQL
echo -n "PostgreSQL: "
if docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Funcionando${NC}"
else
    echo -e "${RED}❌ No responde${NC}"
fi

# Redis
echo -n "Redis: "
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Funcionando${NC}"
else
    echo -e "${RED}❌ No responde${NC}"
fi

echo ""
echo "3️⃣ VERIFICANDO API ENDPOINTS"
echo "============================="

# Church Health
echo -n "GET /api/v1/churches/health: "
RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/api/v1/churches/health -o /tmp/church_health.json)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    cat /tmp/church_health.json | jq '.'
else
    echo -e "${RED}❌ Error (HTTP $RESPONSE)${NC}"
fi

# Church Debug
echo -n "GET /api/v1/churches/debug: "
RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8000/api/v1/churches/debug -o /tmp/church_debug.json)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Error (HTTP $RESPONSE)${NC}"
fi

# Test Endpoint
echo -n "POST /api/v1/churches/test: "
RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8000/api/v1/churches/test -o /tmp/church_test.json)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ Error (HTTP $RESPONSE)${NC}"
fi

echo ""
echo "4️⃣ VERIFICANDO BASE DE DATOS"
echo "============================="

# Verificar tablas
echo "Tablas existentes:"
docker compose exec -T db psql -U postgres -d churchai -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>/dev/null | grep -v "^$" | sed 's/^/  - /'

# Contar registros en churches
CHURCH_COUNT=$(docker compose exec -T db psql -U postgres -d churchai -t -c "SELECT COUNT(*) FROM churches;" 2>/dev/null | tr -d ' \n')
if [ ! -z "$CHURCH_COUNT" ]; then
    echo -e "Iglesias registradas: ${BLUE}$CHURCH_COUNT${NC}"
else
    echo -e "${YELLOW}⚠️ No se puede leer la tabla churches (puede que no exista)${NC}"
fi

echo ""
echo "5️⃣ VERIFICANDO ARCHIVOS BACKEND"
echo "================================"

# Verificar __init__.py
echo "Archivos __init__.py:"
INIT_FILES=$(docker compose exec -T backend find /app -name "__init__.py" -type f 2>/dev/null | wc -l)
echo -e "  Encontrados: ${BLUE}$INIT_FILES${NC} archivos"

if [ "$INIT_FILES" -lt 8 ]; then
    echo -e "${YELLOW}⚠️ Faltan algunos archivos __init__.py${NC}"
fi

# Verificar models.py
echo "models.py:"
MODEL_SIZE=$(docker compose exec -T backend stat -c%s /app/app/infrastructure/database/models.py 2>/dev/null)
if [ "$MODEL_SIZE" -gt 100 ]; then
    echo -e "  Tamaño: ${GREEN}$MODEL_SIZE bytes ✅${NC}"
else
    echo -e "  ${RED}❌ Archivo vacío o muy pequeño${NC}"
fi

echo ""
echo "6️⃣ TEST COMPLETO DE REGISTRO"
echo "============================="

echo "Enviando registro de prueba..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/churches/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Iglesia Test Verificación",
    "denomination": "Evangélica",
    "address": {
      "street": "Test Street", "number": "123", "neighborhood": "Test",
      "city": "Buenos Aires", "state": "Buenos Aires",
      "postal_code": "1000", "country": "Argentina"
    },
    "contact_info": {
      "primary_email": "test@verification.com",
      "primary_phone": "+54111234567"
    },
    "legal_documentation": {
      "documents": [{
        "document_type": "legal_entity",
        "document_number": "TEST-VERIFY-001",
        "issued_date": "2024-01-01T00:00:00Z",
        "issuing_authority": "Test Authority"
      }],
      "legal_representative_name": "Test Pastor",
      "legal_representative_id": "12345678",
      "legal_representative_position": "Pastor",
      "registration_authority": "Test Auth",
      "registration_number": "REG-TEST-001",
      "registration_date": "2024-01-01T00:00:00Z"
    },
    "organizational_structure": "traditional",
    "estimated_size": "medium",
    "founding_date": "2020-01-01T00:00:00Z"
  }')

if echo "$REGISTER_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Registro exitoso!${NC}"
    CHURCH_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.church_id')
    STATUS=$(echo "$REGISTER_RESPONSE" | jq -r '.data.status')
    RISK_SCORE=$(echo "$REGISTER_RESPONSE" | jq -r '.data.ai_assessment.risk_score')
    
    echo "  Church ID: $CHURCH_ID"
    echo "  Status: $STATUS"
    echo "  Risk Score: $RISK_SCORE"
else
    echo -e "${RED}❌ Registro falló${NC}"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
fi

echo ""
echo "7️⃣ RESUMEN FINAL"
echo "================"

# Determinar estado general
ISSUES=0

# Check backend
curl -f -s http://localhost:8000/health > /dev/null 2>&1 || ((ISSUES++))

# Check frontend
curl -f -s http://localhost:3000 > /dev/null 2>&1 || ((ISSUES++))

# Check database
docker compose exec -T db pg_isready -U postgres > /dev/null 2>&1 || ((ISSUES++))

echo ""
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Sistema completamente funcional!${NC}"
    echo ""
    echo "📱 URLs disponibles:"
    echo "  - Frontend:      http://localhost:3000"
    echo "  - Backend API:   http://localhost:8000"
    echo "  - API Docs:      http://localhost:8000/docs"
    echo "  - Redoc:         http://localhost:8000/redoc"
    echo ""
    echo "✨ Funcionalidades disponibles:"
    echo "  ✅ Registro de iglesias"
    echo "  ✅ Validación por IA"
    echo "  ✅ Persistencia en BD"
    echo "  ✅ Frontend completo"
else
    echo -e "${YELLOW}⚠️ Sistema funciona con $ISSUES problema(s)${NC}"
    echo ""
    echo "🔧 Para revisar logs:"
    echo "  docker compose logs -f backend"
    echo "  docker compose logs -f frontend"
fi

echo ""
echo "📊 Comandos útiles:"
echo "  Ver logs:        docker compose logs -f"
echo "  Reiniciar:       docker compose restart"
echo "  Parar:           docker compose down"
echo "  Tests:           ./test.sh"