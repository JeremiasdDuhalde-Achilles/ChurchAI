# 🚀 GUÍA DE SETUP COMPLETA - CHURCHAI

Esta guía te llevará paso a paso desde cero hasta tener ChurchAI corriendo en tu máquina.

---

## 📋 TABLA DE CONTENIDO

1. [Requisitos Previos](#1-requisitos-previos)
2. [Instalación Rápida (Docker)](#2-instalación-rápida-docker)
3. [Instalación Manual (Sin Docker)](#3-instalación-manual-sin-docker)
4. [Verificación de Setup](#4-verificación-de-setup)
5. [Primer Uso](#5-primer-uso)
6. [Configuración Avanzada](#6-configuración-avanzada)
7. [Desarrollo](#7-desarrollo)

---

## 1. REQUISITOS PREVIOS

### Opción A: Con Docker (Recomendado)

```bash
# Verifica que tengas instalado:
docker --version          # Docker 20.10+
docker-compose --version  # Docker Compose 2.0+
git --version            # Git 2.30+
```

**Instalación de Docker:**
- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  ```

### Opción B: Sin Docker

```bash
# Verifica que tengas instalado:
python --version    # Python 3.11+
node --version      # Node.js 18+
npm --version       # NPM 9+
psql --version      # PostgreSQL 15+
```

**Instalación:**
- **Python**: [python.org](https://www.python.org/downloads/)
- **Node.js**: [nodejs.org](https://nodejs.org/)
- **PostgreSQL**: [postgresql.org](https://www.postgresql.org/download/)

---

## 2. INSTALACIÓN RÁPIDA (DOCKER)

### Paso 1: Clonar el Repositorio

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/ChurchAI.git
cd ChurchAI

# 2. Crear archivo .env (opcional)
cp .env.example .env  # Si existe
# O crear uno nuevo:
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/churchai
REDIS_URL=redis://redis:6379/0
SECRET_KEY=churchai-super-secret-key-change-in-production
OPENAI_API_KEY=sk-your-key-here
ENVIRONMENT=development
DEBUG=true
EOF
```

### Paso 2: Levantar Servicios

```bash
# Levantar todo con Docker Compose
docker-compose up --build -d

# Ver el progreso
docker-compose logs -f
```

**Lo que hace este comando:**
1. ✅ Descarga imágenes de Docker (PostgreSQL, Redis)
2. ✅ Construye imagen del backend (FastAPI + Python)
3. ✅ Construye imagen del frontend (React + Vite)
4. ✅ Crea la base de datos
5. ✅ Ejecuta migraciones
6. ✅ Levanta todos los servicios

### Paso 3: Verificar que Todo Funciona

```bash
# Ver el estado de los servicios
docker-compose ps

# Deberías ver algo como:
# NAME              IMAGE         STATUS    PORTS
# churchai-db       postgres:15   Up        0.0.0.0:5432->5432/tcp
# churchai-backend  ...           Up        0.0.0.0:8000->8000/tcp
# churchai-frontend ...           Up        0.0.0.0:3000->3000/tcp
# churchai-redis    redis:7       Up        0.0.0.0:6379->6379/tcp

# Probar backend
curl http://localhost:8000/health
# Respuesta esperada: {"status": "healthy", ...}

# Probar frontend (en navegador)
# Abre: http://localhost:3000
```

### Paso 4: ¡Listo! 🎉

Ahora puedes:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

**Ir a** → [Sección 5: Primer Uso](#5-primer-uso)

---

## 3. INSTALACIÓN MANUAL (SIN DOCKER)

### 3.1 Setup de Base de Datos

```bash
# 1. Crear base de datos
sudo -u postgres psql

# En el prompt de PostgreSQL:
CREATE DATABASE churchai;
CREATE USER churchai_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE churchai TO churchai_user;
\q

# 2. Verificar conexión
psql -U churchai_user -d churchai -h localhost
```

### 3.2 Setup del Backend

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar variables de entorno
export DATABASE_URL="postgresql+asyncpg://churchai_user:tu_password@localhost:5432/churchai"
export SECRET_KEY="churchai-super-secret-key-change-me"
export OPENAI_API_KEY="sk-your-key-here"
export ENVIRONMENT="development"
export DEBUG="true"

# 6. Ejecutar migraciones (si existen)
# alembic upgrade head

# 7. Levantar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Deberías ver:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     🚀 Starting ChurchAI API
```

### 3.3 Setup del Frontend

```bash
# En otra terminal:

# 1. Ir a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF

# 4. Levantar servidor de desarrollo
npm run dev

# Deberías ver:
# VITE v5.0.0  ready in 500 ms
# ➜  Local:   http://localhost:3000/
```

### 3.4 Verificar

```bash
# Backend
curl http://localhost:8000/health

# Frontend
# Abre http://localhost:3000 en tu navegador
```

---

## 4. VERIFICACIÓN DE SETUP

### 4.1 Checklist Completo

```bash
# ✅ 1. Backend Health
curl http://localhost:8000/health
# Esperado: {"status": "healthy", "database": "connected"}

# ✅ 2. API Docs accesible
curl http://localhost:8000/docs
# Esperado: Código HTML de Swagger UI

# ✅ 3. Frontend accesible
curl http://localhost:3000
# Esperado: Código HTML de React

# ✅ 4. Base de datos conectada
# Si usas Docker:
docker-compose exec db psql -U postgres -d churchai -c "SELECT 1;"
# Si es manual:
psql -U churchai_user -d churchai -c "SELECT 1;"
# Esperado:
#  ?column?
# ----------
#         1

# ✅ 5. Tablas creadas
psql -U postgres -d churchai -c "\dt"
# Esperado: Lista de tablas (users, churches, members, etc.)
```

### 4.2 Script de Verificación Automática

```bash
# Ejecutar script de verificación
./scripts/verify_complete.sh

# O crear un script simple:
cat > verify.sh << 'EOF'
#!/bin/bash
echo "🔍 Verificando ChurchAI Setup..."

# Backend
if curl -f -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FAIL"
fi

# Frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAIL"
fi

echo "✅ Verificación completa"
EOF

chmod +x verify.sh
./verify.sh
```

---

## 5. PRIMER USO

### 5.1 Acceder a la Aplicación

```bash
# Abre tu navegador en:
http://localhost:3000
```

### 5.2 Crear Tu Primera Cuenta

1. **Haz clic en "Registrarse"**
2. **Selecciona**: "Soy Pastor y quiero crear mi iglesia"
3. **Completa el formulario**:
   ```
   Email: tu-email@ejemplo.com
   Contraseña: Password123! (mínimo 8 caracteres, 1 mayúscula, 1 número)
   Nombre: Tu Nombre
   Apellido: Tu Apellido
   Teléfono: +5491123456789 (formato internacional)

   Información de Pastor:
   - Nombre de Iglesia: Iglesia Ejemplo
   - Denominación: Pentecostal (u otra)
   - Años de Ministerio: 5
   - Iglesia Anterior: (opcional)
   - Educación Teológica: (opcional)
   ```
4. **Haz clic en "Registrarse"**
5. **Serás redirigido al Dashboard**

### 5.3 Revisar el Estado de Aprobación

El sistema usa IA para evaluar tu registro:

**Aprobado Automáticamente** (Score IA > 75%):
- ✅ Verás un banner verde: "¡Cuenta Aprobada!"
- ✅ Puedes registrar tu iglesia inmediatamente

**En Revisión** (Score IA < 75%):
- ⏳ Verás un banner amarillo: "Cuenta en Revisión"
- ⏳ El equipo revisará tu solicitud manualmente
- ⏳ Recibirás un email cuando sea aprobada

### 5.4 Registrar Tu Iglesia

1. **Haz clic en "Registrar Mi Iglesia"** (si estás aprobado)
2. **Completa el formulario**:

   **Información Básica:**
   ```
   Nombre: Iglesia Esperanza Buenos Aires
   Denominación: Pentecostal
   Fecha de Fundación: 2010-01-15
   Estructura Organizacional: Congregacional
   Tamaño Estimado: 100-500
   ```

   **Dirección:**
   ```
   Calle: Av. Libertador 1234
   Ciudad: Buenos Aires
   Estado/Provincia: CABA
   País: Argentina
   Código Postal: 1425
   ```

   **Contacto:**
   ```
   Email: info@iglesiaesperanza.com
   Teléfono: +5491123456789
   Website: https://iglesiaesperanza.com (opcional)
   ```

   **Documentación Legal:**
   ```
   Representante Legal: Pastor Juan Pérez
   Número de Registro: 12345678 (si aplica)
   Autoridad de Registro: IGJ - Inspección General de Justicia
   ```

3. **Haz clic en "Registrar Iglesia"**
4. **Espera la validación de IA** (2-3 segundos)
5. **Si todo está bien**, verás:
   ```
   ✅ Iglesia registrada exitosamente
   ✅ Código de Invitación: ABC123XYZ
   ✅ Score de Validación: 95/100
   ```

### 5.5 Crear Tu Primer Miembro

1. **Ve a "Gestionar Miembros"** en el dashboard
2. **Haz clic en "Nuevo Miembro"** (botón azul)
3. **Completa el formulario**:

   **Información Personal:**
   ```
   Nombre: María
   Apellido: González
   Email: maria@ejemplo.com
   Teléfono: +5491198765432
   Fecha de Nacimiento: 1990-05-15
   Género: Femenino
   Estado Civil: Casada
   ```

   **Dirección:**
   ```
   Calle: Av. Corrientes 5000
   Ciudad: Buenos Aires
   Estado: CABA
   País: Argentina
   Código Postal: 1414
   ```

   **Información de Membresía:**
   ```
   Tipo de Miembro: Activo
   Fecha de Membresía: 2023-01-01
   Fecha de Bautismo: 2023-06-15 (opcional)
   ```

   **Ministerios y Dones:**
   ```
   Ministerios: Alabanza, Jóvenes
   Dones Espirituales: Música, Enseñanza
   Habilidades: Canto, Guitarra
   ```

   **Contacto de Emergencia:**
   ```
   Nombre: Pedro González
   Relación: Esposo
   Teléfono: +5491187654321
   ```

4. **Haz clic en "Crear Miembro"**
5. **El sistema calculará automáticamente**:
   - ✅ Commitment Score (0-100)
   - ✅ Risk Level (bajo/medio/alto/crítico)
   - ✅ AI Insights
   - ✅ Recomendaciones Pastorales

### 5.6 Explorar el Dashboard

Ahora verás datos reales en tu dashboard:

```
📊 Estadísticas:
- Total Miembros: 1
- Activos: 1
- Visitantes: 0
- En Riesgo: 0
- Asistencia Promedio: 0%
- Compromiso Promedio: 65/100
```

### 5.7 Ver AI Insights

1. **Haz clic en el miembro que creaste**
2. **Observa**:
   - **Commitment Score**: 65/100 (nuevo miembro sin asistencias)
   - **Risk Level**: bajo
   - **AI Insights**: "María es un nuevo miembro. Participante en 2 ministerios: alabanza, jovenes. Miembro hace 1 año y 2 meses."
   - **Sugerencias de Ministerios**: "Escuela Dominical (tiene el don de enseñanza)"
   - **Recomendaciones**: "Nuevo miembro - Asignar mentor"

### 5.8 Registrar Primera Asistencia

1. **En el detalle del miembro**, ve a **"Asistencia"**
2. **Haz clic en "Registrar Asistencia"**
3. **Completa**:
   ```
   Fecha: 2024-01-14 (domingo pasado)
   Tipo de Servicio: Culto Domingo
   Asistió: Sí ✓
   Notas: Participó en alabanza (opcional)
   ```
4. **Guarda**
5. **El sistema recalcula**:
   - Attendance Rate: 100% (asistió 1 de 1)
   - Commitment Score: aumenta a ~75/100

### 5.9 Crear Nota Pastoral

1. **En el detalle del miembro**, ve a **"Notas"**
2. **Haz clic en "Nueva Nota"**
3. **Completa**:
   ```
   Tipo: Visita
   Título: Visita de bienvenida
   Contenido: Visité a María en su casa. Está muy comprometida con el ministerio de alabanza.
   Privada: Sí ✓
   Fecha de Seguimiento: 2024-02-01 (opcional)
   ```
4. **Guarda**

---

## 6. CONFIGURACIÓN AVANZADA

### 6.1 Configurar OpenAI (IA Real)

```bash
# 1. Obtén una API key de OpenAI
# https://platform.openai.com/api-keys

# 2. Edita el archivo .env
nano .env

# 3. Agrega tu key
OPENAI_API_KEY=sk-tu-key-real-aqui

# 4. Reinicia el backend
docker-compose restart backend

# Ahora la IA usará GPT-4 real en lugar de reglas
```

### 6.2 Configurar Email (Notificaciones)

```bash
# En .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-password-de-app
SMTP_FROM=noreply@churchai.com
```

### 6.3 Configurar SSL (Producción)

Ver: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

### 6.4 Configurar Backups

```bash
# Backup manual de base de datos
docker-compose exec db pg_dump -U postgres churchai > backup_$(date +%Y%m%d).sql

# Restaurar
docker-compose exec -T db psql -U postgres churchai < backup_20240115.sql
```

---

## 7. DESARROLLO

### 7.1 Estructura del Proyecto

```
ChurchAI/
├── backend/           # FastAPI (Python)
│   ├── app/
│   │   ├── api/      # Endpoints
│   │   ├── domain/   # Lógica de negocio
│   │   ├── infrastructure/  # DB, repos
│   │   └── main.py   # Entry point
│   ├── tests/        # Tests
│   └── requirements.txt
│
├── frontend/          # React (TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── main.tsx
│   └── package.json
│
├── docs/              # Documentación
├── scripts/           # Scripts útiles
└── docker-compose.yml
```

### 7.2 Desarrollo del Backend

```bash
# 1. Entrar al contenedor
docker-compose exec backend bash

# 2. Correr tests
pytest -v

# 3. Correr con hot-reload (ya está por defecto)
# uvicorn app.main:app --reload

# 4. Ver logs
docker-compose logs -f backend
```

### 7.3 Desarrollo del Frontend

```bash
# 1. Entrar al contenedor
docker-compose exec frontend sh

# 2. Instalar nueva dependencia
npm install nombre-paquete

# 3. Build para producción
npm run build

# 4. Ver logs
docker-compose logs -f frontend
```

### 7.4 Comandos Útiles

```bash
# Makefile shortcuts:
make up          # Levantar servicios
make down        # Bajar servicios
make logs        # Ver logs
make test        # Ejecutar tests
make clean       # Limpiar todo (⚠️ borra datos)
make restart     # Reiniciar servicios

# Docker Compose:
docker-compose up -d              # Levantar en background
docker-compose down               # Bajar servicios
docker-compose restart backend    # Reiniciar solo backend
docker-compose logs -f --tail=100 # Últimas 100 líneas de log
docker-compose exec backend bash  # Entrar al contenedor
docker-compose ps                 # Ver estado
```

### 7.5 Hot Reload

**Backend (Python)**:
- ✅ Automático con `--reload` de uvicorn
- Cualquier cambio en `backend/app/*.py` se refleja inmediatamente

**Frontend (React)**:
- ✅ Automático con Vite
- Cualquier cambio en `frontend/src/*.tsx` se refleja inmediatamente

---

## 🎉 ¡LISTO!

Ahora tienes ChurchAI completamente configurado y funcionando.

### Próximos Pasos

1. ✅ Explora la [Guía de Testing](./TESTING.md)
2. ✅ Lee la [Documentación de API](http://localhost:8000/docs)
3. ✅ Ve el [README principal](../readme.md) para arquitectura
4. ✅ Configura tu iglesia y miembros
5. ✅ Experimenta con las funcionalidades de IA

### Recursos

- 📚 [Documentación API](http://localhost:8000/docs)
- 🧪 [Guía de Testing](./TESTING.md)
- 🚀 [Guía de Deployment](./DEPLOYMENT.md)
- 💬 [Soporte](https://github.com/tu-repo/issues)

---

**¿Necesitas ayuda?** Abre un issue en GitHub o consulta la documentación.

**¡Feliz desarrollo! 🚀**
