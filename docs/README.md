# 📚 DOCUMENTACIÓN CHURCHAI

Bienvenido a la documentación completa de ChurchAI.

---

## 📋 ÍNDICE DE DOCUMENTOS

### Para Empezar

1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Guía completa de instalación y configuración
   - ✅ Instalación con Docker (recomendado)
   - ✅ Instalación manual (sin Docker)
   - ✅ Primer uso paso a paso
   - ✅ Configuración avanzada

2. **[TESTING.md](./TESTING.md)** - Guía completa de testing
   - ✅ Testing con CURL (línea de comandos)
   - ✅ Testing con Postman
   - ✅ Testing Frontend (navegador)
   - ✅ Tests automatizados
   - ✅ Troubleshooting

### Documentación del Proyecto

3. **[../readme.md](../readme.md)** - Análisis completo del proyecto
   - Arquitectura del sistema
   - Módulos implementados
   - Stack tecnológico
   - Recomendaciones

---

## 🚀 INICIO RÁPIDO

### ¿Nuevo en el proyecto?

1. **Lee primero**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Instalación Rápida"
2. **Levanta el proyecto**:
   ```bash
   docker-compose up --build -d
   ```
3. **Verifica que funciona**:
   ```bash
   curl http://localhost:8000/health
   # Abre http://localhost:3000 en tu navegador
   ```
4. **Sigue el tutorial**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Primer Uso"

### ¿Listo para probar?

1. **Lee**: [TESTING.md](./TESTING.md)
2. **Elige tu método**:
   - CURL → Para pruebas rápidas
   - Postman → Para testing estructurado
   - Frontend → Para experiencia completa

---

## 📚 GUÍAS POR ROL

### Soy Desarrollador Frontend

1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Desarrollo Frontend"
2. [TESTING.md](./TESTING.md) → Sección "Testing Frontend"
3. Ver: `frontend/src/` para el código fuente

**Tecnologías**:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query
- React Hook Form + Zod

### Soy Desarrollador Backend

1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Desarrollo Backend"
2. [TESTING.md](./TESTING.md) → Sección "Tests Automatizados"
3. Ver: `backend/app/` para el código fuente

**Tecnologías**:
- FastAPI
- PostgreSQL + SQLAlchemy
- Python 3.11+
- Clean Architecture + DDD

### Soy QA / Tester

1. [TESTING.md](./TESTING.md) → Completo
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Verificación de Setup"

**Herramientas**:
- Pytest (backend)
- CURL
- Postman
- Navegador (frontend manual testing)

### Soy DevOps / SRE

1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Configuración Avanzada"
2. Ver: `docker-compose.yml` y `Makefile`

**Stack**:
- Docker + Docker Compose
- PostgreSQL 15
- Redis (futuro)

### Soy Product Manager / Pastor

1. [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Sección "Primer Uso"
2. [TESTING.md](./TESTING.md) → Sección "Testing Frontend"

**Funcionalidades clave**:
- Dashboard con métricas en tiempo real
- Gestión de miembros con IA
- Recomendaciones pastorales automáticas
- Análisis de riesgo de abandono

---

## 🎯 FLUJOS COMUNES

### Flujo 1: Setup desde Cero

```bash
# 1. Clonar proyecto
git clone <repo-url>
cd ChurchAI

# 2. Levantar servicios
docker-compose up --build -d

# 3. Verificar
curl http://localhost:8000/health

# 4. Abrir frontend
# http://localhost:3000
```

**Tiempo estimado**: 5-10 minutos

### Flujo 2: Crear y Probar un Miembro

```bash
# 1. Registrarse como pastor (frontend o API)
# 2. Registrar iglesia
# 3. Crear miembro vía API:

curl -X POST http://localhost:8000/api/v1/members/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "María",
    "last_name": "González",
    "email": "maria@ejemplo.com",
    "member_type": "activo",
    "ministries": ["alabanza"],
    "spiritual_gifts": ["musica"]
  }'

# 4. Ver AI insights:
curl http://localhost:8000/api/v1/members/{id}/ai-insights \
  -H "Authorization: Bearer $TOKEN"
```

**Tiempo estimado**: 2-3 minutos

### Flujo 3: Agregar una Nueva Feature

```bash
# 1. Crear rama
git checkout -b feature/nombre-feature

# 2. Desarrollar
# - Backend: backend/app/...
# - Frontend: frontend/src/...

# 3. Probar localmente
docker-compose restart backend
# Probar manualmente o con tests

# 4. Commit y push
git add .
git commit -m "Add: nueva feature"
git push origin feature/nombre-feature
```

---

## 🔧 COMANDOS ÚTILES

### Docker Compose

```bash
# Levantar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend

# Entrar a un contenedor
docker-compose exec backend bash

# Bajar todo
docker-compose down

# Bajar todo + borrar volúmenes (⚠️ borra DB)
docker-compose down -v

# Reconstruir imágenes
docker-compose up --build -d
```

### Makefile

```bash
make up          # docker-compose up -d
make down        # docker-compose down
make logs        # docker-compose logs -f
make test        # Ejecutar tests
make clean       # Limpiar todo (⚠️)
make restart     # Reiniciar servicios
make health      # Health check
```

### Testing

```bash
# Backend tests
docker-compose exec backend pytest -v

# Test específico
docker-compose exec backend pytest backend/tests/test_full_flow.py -v

# Script de verificación
./scripts/test.sh
./scripts/verify_complete.sh
```

---

## 📞 SOPORTE

### ¿Encontraste un bug?

1. Revisa [TESTING.md](./TESTING.md) → Sección "Troubleshooting"
2. Verifica logs: `docker-compose logs -f`
3. Abre un issue en GitHub con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Ambiente (Docker/manual, OS, etc.)

### ¿Necesitas ayuda con setup?

1. Lee [SETUP_GUIDE.md](./SETUP_GUIDE.md) completo
2. Ejecuta el script de verificación: `./scripts/verify_complete.sh`
3. Si el problema persiste, abre un issue

### ¿Quieres contribuir?

1. Lee el README principal: [../readme.md](../readme.md)
2. Crea una rama feature: `git checkout -b feature/tu-feature`
3. Desarrolla y prueba localmente
4. Haz un PR con descripción detallada

---

## 🗺️ ROADMAP DE DOCUMENTACIÓN

### ✅ Completado

- [x] Guía de Setup completa
- [x] Guía de Testing completa
- [x] Análisis de arquitectura
- [x] Comandos útiles

### 🚧 En Progreso

- [ ] Guía de Deployment (producción)
- [ ] Guía de contribución (CONTRIBUTING.md)
- [ ] API Reference completa

### 📅 Futuro

- [ ] Guía de migración de datos
- [ ] Guía de escalamiento
- [ ] Guía de monitoreo y logs
- [ ] Tutorial en video

---

## 📄 ESTRUCTURA DE DOCUMENTACIÓN

```
docs/
├── README.md           # Este archivo (índice)
├── SETUP_GUIDE.md      # Instalación y configuración
├── TESTING.md          # Testing completo
└── DEPLOYMENT.md       # (Futuro) Deploy en producción
```

---

## 🌟 MEJORES PRÁCTICAS

### Al desarrollar

1. ✅ Lee la documentación relevante primero
2. ✅ Prueba localmente antes de commitear
3. ✅ Escribe tests para nuevas features
4. ✅ Actualiza la documentación si agregas funcionalidades

### Al hacer testing

1. ✅ Usa el script de verificación: `./scripts/verify_complete.sh`
2. ✅ Prueba tanto éxito como casos de error
3. ✅ Documenta bugs encontrados
4. ✅ Verifica que los tests automatizados pasen

### Al reportar issues

1. ✅ Descripción clara del problema
2. ✅ Pasos para reproducir
3. ✅ Comportamiento esperado vs actual
4. ✅ Logs y screenshots
5. ✅ Ambiente (Docker/manual, versión, OS)

---

## 📚 RECURSOS ADICIONALES

### Documentación Externa

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Docker**: https://docs.docker.com/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Documentación del Proyecto

- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

### Comunidad

- GitHub Issues: (Tu repo URL)/issues
- Discussions: (Tu repo URL)/discussions

---

**Última actualización**: 2025-01-15

**Versión del proyecto**: 1.0.0

**¿Preguntas?** Abre un issue en GitHub o consulta los docs.

**¡Happy Coding! 🚀**
