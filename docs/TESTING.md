# 🧪 GUÍA COMPLETA DE TESTING - CHURCHAI

Esta guía cubre todas las formas de probar la aplicación ChurchAI: curl, Postman y frontend.

---

## 📋 TABLA DE CONTENIDO

1. [Setup Inicial](#1-setup-inicial)
2. [Testing con CURL](#2-testing-con-curl)
3. [Testing con Postman](#3-testing-con-postman)
4. [Testing Frontend](#4-testing-frontend)
5. [Tests Automatizados](#5-tests-automatizados)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. SETUP INICIAL

### Requisitos Previos
- Docker y Docker Compose instalados
- Git instalado
- Node.js 18+ (para desarrollo frontend local)
- PostgreSQL 15 (si quieres correr fuera de Docker)

### Levantar el proyecto

```bash
# 1. Clonar el repositorio (si aún no lo has hecho)
git clone <URL_DEL_REPO>
cd ChurchAI

# 2. Levantar todos los servicios
docker-compose up --build -d

# 3. Verificar que todo está corriendo
docker-compose ps

# Deberías ver:
# - db (PostgreSQL) - UP
# - backend (FastAPI) - UP
# - frontend (React/Vite) - UP
# - redis - UP

# 4. Ver logs en tiempo real
docker-compose logs -f

# 5. Verificar health de los servicios
curl http://localhost:8000/health
curl http://localhost:3000
```

### URLs de los servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | http://localhost:8000 | API REST FastAPI |
| API Docs (Swagger) | http://localhost:8000/docs | Documentación interactiva |
| API Docs (ReDoc) | http://localhost:8000/redoc | Documentación alternativa |
| Frontend | http://localhost:3000 | Aplicación React |
| PostgreSQL | localhost:5432 | Base de datos |
| Redis | localhost:6379 | Cache (futuro) |

---

## 2. TESTING CON CURL

### 2.1 Autenticación

#### Registrar un Pastor (Nuevo)

```bash
# Registro de pastor que creará una iglesia nueva
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pastor@ejemplo.com",
    "password": "Password123!",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+5491123456789",
    "role": "PASTOR_PRINCIPAL",
    "registration_type": "pastor_new_church",
    "pastor_info": {
      "church_name": "Iglesia Esperanza",
      "denomination": "Pentecostal",
      "years_of_ministry": 10,
      "previous_church": "Iglesia Fe",
      "theological_education": "Seminario Teológico Buenos Aires"
    }
  }'

# Respuesta exitosa:
{
  "message": "Usuario registrado exitosamente",
  "user_id": "uuid-aqui",
  "status": "pending_approval",
  "can_create_church": false,
  "ai_approval_score": 0.85,
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Login

```bash
# Login con credenciales
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pastor@ejemplo.com",
    "password": "Password123!"
  }'

# Respuesta exitosa:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "pastor@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "PASTOR_PRINCIPAL",
    "status": "active",
    "can_create_church": true,
    "has_church": false
  }
}

# ⚠️ IMPORTANTE: Guarda el access_token para las siguientes requests
export TOKEN="tu_access_token_aqui"
```

#### Obtener Usuario Actual

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Refresh Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "tu_refresh_token_aqui"
  }'
```

### 2.2 Gestión de Iglesias

#### Registrar Iglesia

```bash
curl -X POST http://localhost:8000/api/v1/churches/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Iglesia Esperanza",
    "denomination": "Pentecostal",
    "founding_date": "2010-01-15",
    "organizational_structure": "Congregacional",
    "estimated_size": "100-500",
    "address": {
      "street": "Av. Libertador 1234",
      "city": "Buenos Aires",
      "state": "CABA",
      "country": "Argentina",
      "postal_code": "1425"
    },
    "contact_info": {
      "email": "info@iglesiaesperanza.com",
      "phone": "+5491123456789",
      "website": "https://iglesiaesperanza.com"
    },
    "legal_documentation": {
      "legal_representative_name": "Pastor Juan Pérez",
      "registration_number": "12345678",
      "registration_authority": "IGJ - Inspección General de Justicia"
    }
  }'

# Respuesta exitosa:
{
  "id": "uuid",
  "name": "Iglesia Esperanza",
  "status": "active",
  "is_validated": true,
  "invitation_code": "ABC123XYZ",
  "ai_risk_score": 0.15,
  "message": "Iglesia registrada y validada automáticamente"
}
```

#### Health Check de Iglesias

```bash
curl http://localhost:8000/api/v1/churches/health
```

### 2.3 Gestión de Miembros

#### Crear Miembro

```bash
curl -X POST http://localhost:8000/api/v1/members/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "González",
    "email": "maria@ejemplo.com",
    "phone": "+5491198765432",
    "birth_date": "1990-05-15",
    "gender": "femenino",
    "marital_status": "casada",
    "address": {
      "street": "Av. Corrientes 5000",
      "city": "Buenos Aires",
      "state": "CABA",
      "country": "Argentina",
      "postal_code": "1414"
    },
    "member_type": "activo",
    "membership_date": "2023-01-01",
    "baptism_date": "2023-06-15",
    "ministries": ["alabanza", "jovenes"],
    "spiritual_gifts": ["musica", "ensenanza"],
    "skills": ["canto", "guitarra"],
    "preferred_contact_method": "whatsapp",
    "emergency_contact": {
      "name": "Pedro González",
      "relationship": "esposo",
      "phone": "+5491187654321"
    }
  }'

# Respuesta incluye scores de IA calculados automáticamente
{
  "id": "uuid",
  "first_name": "María",
  "last_name": "González",
  "commitment_score": 65.5,
  "risk_level": "bajo",
  "attendance_rate": 0.0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Listar Miembros

```bash
# Todos los miembros
curl -X GET "http://localhost:8000/api/v1/members/" \
  -H "Authorization: Bearer $TOKEN"

# Con filtros
curl -X GET "http://localhost:8000/api/v1/members/?member_type=activo&limit=10&skip=0" \
  -H "Authorization: Bearer $TOKEN"

# Buscar por texto
curl -X GET "http://localhost:8000/api/v1/members/?search=María" \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por nivel de riesgo
curl -X GET "http://localhost:8000/api/v1/members/?risk_level=alto" \
  -H "Authorization: Bearer $TOKEN"
```

#### Obtener Miembro Específico

```bash
curl -X GET "http://localhost:8000/api/v1/members/{member_id}" \
  -H "Authorization: Bearer $TOKEN"
```

#### Actualizar Miembro

```bash
curl -X PUT "http://localhost:8000/api/v1/members/{member_id}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5491199999999",
    "ministries": ["alabanza", "jovenes", "intercesion"]
  }'
```

#### Eliminar Miembro

```bash
curl -X DELETE "http://localhost:8000/api/v1/members/{member_id}" \
  -H "Authorization: Bearer $TOKEN"
```

### 2.4 IA y Análisis

#### Estadísticas de Iglesia

```bash
curl -X GET "http://localhost:8000/api/v1/members/stats" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta:
{
  "total_members": 150,
  "active_members": 120,
  "visitors": 15,
  "inactive_members": 15,
  "members_at_risk": 8,
  "average_attendance_rate": 75.5,
  "average_commitment_score": 68.3,
  "ministries_coverage": 85.0,
  "small_groups_participation": 70.0
}
```

#### Miembros en Riesgo

```bash
curl -X GET "http://localhost:8000/api/v1/members/at-risk" \
  -H "Authorization: Bearer $TOKEN"
```

#### AI Insights de un Miembro

```bash
curl -X GET "http://localhost:8000/api/v1/members/{member_id}/ai-insights" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta:
{
  "member_id": "uuid",
  "commitment_score": 85.5,
  "risk_level": "bajo",
  "insights": "María demuestra un compromiso excepcional (score: 85/100). Asistencia excelente (88%). Activa en 2 ministerios: alabanza, jovenes. Miembro hace 1 año y 2 meses.",
  "ministry_suggestions": [
    {
      "ministry": "Escuela Dominical",
      "reason": "Tiene el don de enseñanza",
      "priority": "alta"
    }
  ],
  "trend": "positive",
  "last_calculated": "2024-01-15T10:30:00Z"
}
```

#### Recomendaciones Pastorales

```bash
curl -X GET "http://localhost:8000/api/v1/members/{member_id}/recommendations" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta:
{
  "member_id": "uuid",
  "member_name": "María González",
  "recommendations": [
    {
      "type": "birthday",
      "priority": "alta",
      "action": "Enviar felicitación de cumpleaños",
      "description": "Cumpleaños en 3 días",
      "suggested_channel": "whatsapp",
      "due_date": "2024-05-15"
    }
  ],
  "total_recommendations": 1,
  "generated_at": "2024-01-15T10:30:00Z"
}
```

#### Recalcular Scores

```bash
curl -X POST "http://localhost:8000/api/v1/members/{member_id}/recalculate" \
  -H "Authorization: Bearer $TOKEN"
```

### 2.5 Notas Pastorales

#### Crear Nota

```bash
curl -X POST "http://localhost:8000/api/v1/members/{member_id}/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note_type": "visita",
    "title": "Visita pastoral",
    "content": "Visité a María en su hogar. Está pasando por un momento difícil...",
    "is_private": true,
    "follow_up_date": "2024-02-01"
  }'
```

#### Obtener Notas

```bash
curl -X GET "http://localhost:8000/api/v1/members/{member_id}/notes" \
  -H "Authorization: Bearer $TOKEN"
```

### 2.6 Asistencia

#### Registrar Asistencia

```bash
curl -X POST "http://localhost:8000/api/v1/members/{member_id}/attendance" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_date": "2024-01-14",
    "service_type": "culto_domingo",
    "attended": true,
    "notes": "Participó en alabanza"
  }'
```

#### Obtener Historial de Asistencia

```bash
curl -X GET "http://localhost:8000/api/v1/members/{member_id}/attendance?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. TESTING CON POSTMAN

### 3.1 Importar Colección

Crea una nueva colección en Postman llamada "ChurchAI API".

### 3.2 Configurar Variables de Entorno

En Postman, crea un Environment llamado "ChurchAI Local" con:

```
base_url = http://localhost:8000
access_token = (se llenará automáticamente)
refresh_token = (se llenará automáticamente)
member_id = (se llenará automáticamente)
```

### 3.3 Requests de Autenticación

#### 1. Register Pastor

**POST** `{{base_url}}/api/v1/auth/register`

**Body (JSON)**:
```json
{
  "email": "pastor@ejemplo.com",
  "password": "Password123!",
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+5491123456789",
  "role": "PASTOR_PRINCIPAL",
  "registration_type": "pastor_new_church",
  "pastor_info": {
    "church_name": "Iglesia Esperanza",
    "denomination": "Pentecostal",
    "years_of_ministry": 10
  }
}
```

**Tests (para guardar el token automáticamente)**:
```javascript
// En la pestaña "Tests" de Postman
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
}
```

#### 2. Login

**POST** `{{base_url}}/api/v1/auth/login`

**Body (JSON)**:
```json
{
  "email": "pastor@ejemplo.com",
  "password": "Password123!"
}
```

**Tests**:
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
    pm.environment.set("refresh_token", jsonData.refresh_token);
}
```

#### 3. Get Current User

**GET** `{{base_url}}/api/v1/auth/me`

**Headers**:
```
Authorization: Bearer {{access_token}}
```

### 3.4 Requests de Iglesias

#### Register Church

**POST** `{{base_url}}/api/v1/churches/register`

**Headers**:
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body**:
```json
{
  "name": "Iglesia Esperanza",
  "denomination": "Pentecostal",
  "founding_date": "2010-01-15",
  "organizational_structure": "Congregacional",
  "estimated_size": "100-500",
  "address": {
    "street": "Av. Libertador 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "country": "Argentina",
    "postal_code": "1425"
  },
  "contact_info": {
    "email": "info@iglesiaesperanza.com",
    "phone": "+5491123456789",
    "website": "https://iglesiaesperanza.com"
  },
  "legal_documentation": {
    "legal_representative_name": "Pastor Juan Pérez",
    "registration_number": "12345678",
    "registration_authority": "IGJ"
  }
}
```

### 3.5 Requests de Miembros

Ver ejemplos en la sección CURL arriba. Para cada request:

1. Crear un nuevo request en Postman
2. Seleccionar el método HTTP correcto
3. Agregar la URL `{{base_url}}/api/v1/members/...`
4. En Headers, agregar: `Authorization: Bearer {{access_token}}`
5. Si es POST/PUT, agregar el body JSON

---

## 4. TESTING FRONTEND

### 4.1 Acceder a la Aplicación

```bash
# Asegúrate de que los servicios estén corriendo
docker-compose up -d

# Abre en tu navegador:
http://localhost:3000
```

### 4.2 Flujo de Prueba Completo

#### Paso 1: Registro de Pastor

1. Ve a http://localhost:3000
2. Haz clic en "Registrarse"
3. Selecciona "Soy Pastor y quiero crear mi iglesia"
4. Completa el formulario:
   - Email: `pastor@ejemplo.com`
   - Contraseña: `Password123!`
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - Teléfono: `+5491123456789`
   - Información de pastor:
     - Nombre de iglesia: `Iglesia Esperanza`
     - Denominación: `Pentecostal`
     - Años de ministerio: `10`
5. Haz clic en "Registrarse"
6. Deberías ser redirigido al dashboard

#### Paso 2: Ver Dashboard

1. Observa el banner que dice si estás aprobado o pendiente
2. Si estás aprobado, verás el botón "Registrar Mi Iglesia"

#### Paso 3: Registrar Iglesia

1. Haz clic en "Registrar Mi Iglesia"
2. Completa todos los campos del formulario
3. Haz clic en "Registrar Iglesia"
4. Espera la validación de IA
5. Si todo está bien, serás redirigido al dashboard con tu iglesia registrada

#### Paso 4: Ver Estadísticas

1. En el dashboard, verás las tarjetas de estadísticas:
   - Total Miembros
   - Activos
   - Visitantes
   - En Riesgo
   - Asistencia Promedio
   - Compromiso Promedio
2. Al principio todos estarán en 0 porque no hay miembros

#### Paso 5: Crear Miembro

1. Haz clic en "Gestionar Miembros" en las acciones rápidas
2. Haz clic en "Nuevo Miembro"
3. Completa el formulario:
   - Nombre: `María`
   - Apellido: `González`
   - Email: `maria@ejemplo.com`
   - Teléfono: `+5491198765432`
   - Fecha de nacimiento: `1990-05-15`
   - Tipo de miembro: `Activo`
   - Fecha de membresía: `2023-01-01`
   - Ministerios: Selecciona algunos
   - Dones espirituales: Selecciona algunos
4. Haz clic en "Crear Miembro"
5. Verás el miembro en la tabla

#### Paso 6: Ver Detalles del Miembro

1. Haz clic en el miembro que creaste
2. Verás:
   - Información básica
   - Score de compromiso (generado por IA)
   - Nivel de riesgo
   - AI Insights
   - Recomendaciones pastorales
   - Historial de asistencia

#### Paso 7: Registrar Asistencia

1. En la página del miembro, ve a la pestaña "Asistencia"
2. Haz clic en "Registrar Asistencia"
3. Selecciona la fecha y tipo de servicio
4. Marca si asistió o no
5. Guarda
6. El score de asistencia se actualizará

#### Paso 8: Ver Miembros en Riesgo

1. Regresa al dashboard
2. En el widget "Miembros en Riesgo", verás los miembros que tienen:
   - Baja asistencia
   - Ausencias prolongadas
   - Bajo compromiso

#### Paso 9: Crear Nota Pastoral

1. Ve al detalle de un miembro
2. Haz clic en "Nueva Nota"
3. Selecciona el tipo (visita, consejería, seguimiento)
4. Escribe el título y contenido
5. Marca si es privada o no
6. Opcionalmente agrega fecha de seguimiento
7. Guarda

#### Paso 10: Ver AI Insights y Recomendaciones

1. En el detalle del miembro, verás:
   - **AI Insights**: Análisis narrativo del compromiso del miembro
   - **Sugerencias de Ministerios**: Basadas en dones y habilidades
   - **Recomendaciones**: Acciones sugeridas con prioridad
   - **Trend**: Si su compromiso está mejorando o empeorando

### 4.3 Funcionalidades a Probar

✅ **Autenticación**
- [ ] Registro de pastor
- [ ] Login
- [ ] Logout
- [ ] Verificación de token al recargar

✅ **Gestión de Iglesia**
- [ ] Registro de iglesia
- [ ] Ver información de iglesia
- [ ] Ver código de invitación

✅ **Dashboard**
- [ ] Ver estadísticas en tiempo real
- [ ] Ver miembros en riesgo
- [ ] Navegación a diferentes secciones

✅ **Gestión de Miembros**
- [ ] Listar miembros
- [ ] Filtrar por tipo (activo, visitante, inactivo)
- [ ] Filtrar por nivel de riesgo
- [ ] Buscar por nombre/email
- [ ] Crear miembro
- [ ] Editar miembro
- [ ] Eliminar miembro
- [ ] Ver detalle completo

✅ **IA y Análisis**
- [ ] Ver commitment score
- [ ] Ver risk level
- [ ] Ver AI insights
- [ ] Ver recomendaciones pastorales
- [ ] Ver sugerencias de ministerios
- [ ] Recalcular scores

✅ **Notas Pastorales**
- [ ] Crear nota
- [ ] Ver historial de notas
- [ ] Filtrar notas privadas/públicas

✅ **Asistencia**
- [ ] Registrar asistencia
- [ ] Ver historial
- [ ] Ver gráfico de asistencia
- [ ] Ver attendance rate actualizado

### 4.4 Casos de Uso Específicos

#### Caso 1: Pastor Encuentra Miembro en Riesgo

1. Login como pastor
2. Ve al dashboard
3. Observa el widget "Miembros en Riesgo"
4. Hace clic en un miembro con riesgo "alto"
5. Ve las recomendaciones de IA (ej: "Ausente 45 días - Llamar urgente")
6. Crea una nota pastoral: "Llamé a Juan, está pasando por problemas familiares"
7. Programa una visita (fecha de seguimiento)
8. El sistema recalcula el nivel de riesgo

#### Caso 2: Pastor Busca Voluntario para Ministerio

1. Va a "Gestionar Miembros"
2. Ve la lista completa
3. Observa en cada tarjeta los dones espirituales y habilidades
4. Busca miembros con el don de "música"
5. Abre el detalle de uno
6. Ve las sugerencias de ministerios (ej: "Alabanza, Coro")
7. Contacta al miembro para invitarlo

#### Caso 3: Pastor Prepara Reporte de Métricas

1. Va al dashboard
2. Observa las estadísticas:
   - Total de miembros
   - % de activos
   - Asistencia promedio
   - Compromiso promedio
   - Miembros en riesgo
3. Va a "Miembros en Riesgo"
4. Identifica patrones (ej: muchos jóvenes ausentes)
5. Crea estrategia pastoral basada en datos

---

## 5. TESTS AUTOMATIZADOS

### 5.1 Tests de Backend (Pytest)

```bash
# Ejecutar todos los tests
docker-compose exec backend pytest -v

# Ejecutar test específico
docker-compose exec backend pytest backend/tests/test_full_flow.py -v

# Ejecutar con cobertura
docker-compose exec backend pytest --cov=app --cov-report=html
```

### 5.2 Tests desde Scripts

```bash
# Test rápido con curl
./scripts/test.sh

# Verificación completa
./scripts/verify_complete.sh
```

### 5.3 Resultados Esperados

```
🎉 TEST COMPLETO EXITOSO!

✅ Autenticación: FUNCIONANDO
✅ Gestión de Iglesias: FUNCIONANDO
✅ Gestión de Miembros: FUNCIONANDO
✅ IA de Análisis: FUNCIONANDO
✅ Sistema de Recomendaciones: FUNCIONANDO
✅ Estadísticas: FUNCIONANDO

🚀 BACKEND 100% OPERATIVO
```

---

## 6. TROUBLESHOOTING

### Backend no levanta

```bash
# Ver logs
docker-compose logs backend

# Reiniciar servicio
docker-compose restart backend

# Reconstruir
docker-compose up --build -d backend
```

### Frontend no se conecta al backend

1. Verifica que el proxy esté configurado en `vite.config.ts`
2. Verifica que el backend esté corriendo en puerto 8000
3. Abre las DevTools del navegador y ve la pestaña Network
4. Verifica que las requests vayan a `/api/v1/...`

### Error 401 Unauthorized

- El token expiró o es inválido
- Haz login nuevamente
- Verifica que el header Authorization esté bien formado: `Bearer TOKEN`

### Error 403 Forbidden

- No tienes permisos para esa acción
- Verifica que tu usuario tenga `can_create_church: true` si intentas registrar iglesia
- Verifica que tengas iglesia registrada si intentas gestionar miembros

### Base de datos se perdió

```bash
# Resetear base de datos
docker-compose down -v
docker-compose up --build -d

# Esperar a que se cree la BD nuevamente
sleep 10

# Verificar
docker-compose logs db
```

### Puerto ocupado

```bash
# Si el puerto 8000, 3000 o 5432 está ocupado
# Opción 1: Detener el proceso que lo usa
lsof -ti:8000 | xargs kill -9

# Opción 2: Cambiar el puerto en docker-compose.yml
# Por ejemplo, cambiar 8000:8000 a 8001:8000
```

---

## 📞 SOPORTE

Si encuentras algún problema:

1. Revisa esta guía primero
2. Verifica los logs: `docker-compose logs -f`
3. Verifica el estado: `docker-compose ps`
4. Reinicia los servicios: `docker-compose restart`
5. Si el problema persiste, abre un issue en GitHub

---

**¡Happy Testing! 🚀**
