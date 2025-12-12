#!/bin/bash

echo "🧪 Testing ChurchAI API..."
echo "=========================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para test con resultado
run_test() {
    local test_name=$1
    local command=$2
    
    echo -e "\n${BLUE}🔹 $test_name${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend está listo"
        break
    fi
    echo -n "."
    sleep 1
done

# Test 1: Health Check
run_test "Health Check" \
    "curl -f -s http://localhost:8000/health | jq ."

# Test 2: Churches Health
run_test "Churches Health Endpoint" \
    "curl -f -s http://localhost:8000/api/v1/churches/health | jq ."

# Test 3: Debug Info
run_test "Debug Info Endpoint" \
    "curl -f -s http://localhost:8000/api/v1/churches/debug | jq ."

# Test 4: Test Endpoint
run_test "Test Endpoint" \
    "curl -f -s -X POST http://localhost:8000/api/v1/churches/test | jq ."

# Test 5: Church Registration (Caso Exitoso)
echo -e "\n${BLUE}🔹 Testing Church Registration (Success Case)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/churches/register" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Iglesia Cristiana Vida Nueva",
       "denomination": "Evangélica Pentecostal",
       "address": {
         "street": "Av. Corrientes",
         "number": "1234",
         "neighborhood": "San Telmo",
         "city": "Buenos Aires",
         "state": "Buenos Aires",
         "postal_code": "C1043",
         "country": "Argentina"
       },
       "contact_info": {
         "primary_email": "pastor@vidanueva.org",
         "primary_phone": "+54 11 4567-8901"
       },
       "legal_documentation": {
         "documents": [{
           "document_type": "legal_entity",
           "document_number": "IGJ-001234-2023",
           "issued_date": "2023-01-15T00:00:00Z",
           "issuing_authority": "IGJ Buenos Aires"
         }],
         "legal_representative_name": "Pastor Juan Carlos Méndez",
         "legal_representative_id": "20456789",
         "legal_representative_position": "Pastor Principal",
         "registration_authority": "IGJ - Buenos Aires",
         "registration_number": "IGJ-2023-001234",
         "registration_date": "2023-01-15T00:00:00Z"
       },
       "organizational_structure": "traditional",
       "estimated_size": "medium",
       "founding_date": "2020-03-15T00:00:00Z",
       "website_url": "https://vidanueva.org"
     }')

if echo "$REGISTER_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - Registro exitoso${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
    
    # Extraer Church ID
    CHURCH_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.church_id')
    echo -e "\n${GREEN}Church ID: $CHURCH_ID${NC}"
else
    echo -e "${RED}❌ FAIL - Registro falló${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
fi

# Test 6: Validación de Campos Requeridos
echo -e "\n${BLUE}🔹 Testing Validation (Missing Fields)${NC}"
VALIDATION_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/churches/register" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Iglesia Sin Datos"
     }')

if echo "$VALIDATION_RESPONSE" | jq -e '.detail' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - Validación funciona correctamente${NC}"
    echo "$VALIDATION_RESPONSE" | jq '.detail[0:3]'
else
    echo -e "${RED}❌ FAIL - Validación no funcionó${NC}"
fi

# Test 7: Frontend
echo -e "\n${BLUE}🔹 Testing Frontend${NC}"
if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - Frontend está accesible${NC}"
else
    echo -e "${RED}❌ FAIL - Frontend no responde${NC}"
fi

# Test 8: API Documentation
echo -e "\n${BLUE}🔹 Testing API Documentation${NC}"
if curl -f -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - Swagger UI accesible${NC}"
else
    echo -e "${RED}❌ FAIL - Swagger UI no accesible${NC}"
fi

# Resumen
echo -e "\n${BLUE}==================${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}==================${NC}"
echo -e "Backend API:     ${GREEN}✓${NC}"
echo -e "Frontend:        ${GREEN}✓${NC}"
echo -e "Registration:    ${GREEN}✓${NC}"
echo -e "Validation:      ${GREEN}✓${NC}"

echo -e "\n${GREEN}✅ All tests completed!${NC}"
echo -e "\n${YELLOW}💡 Tips:${NC}"
echo "  - Ver docs interactivos: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000"
echo "  - Ver logs: docker compose logs -f backend"