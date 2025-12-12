#!/bin/bash
echo "🔧 Setting up ChurchAI Database..."

# Verificar que los servicios estén corriendo
docker compose ps db

# Crear tablas
docker compose exec backend python app.database_setup.py

# Verificar que las tablas se crearon
echo "🔍 Verificando tablas creadas:"
docker compose exec db psql -U postgres -d churchai -c "\dt"

# Mostrar estructura de la tabla churches
echo "📊 Estructura de tabla churches:"
docker compose exec db psql -U postgres -d churchai -c "\d churches"

echo "✅ Database setup completed!"
