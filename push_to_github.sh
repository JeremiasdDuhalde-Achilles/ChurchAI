#!/bin/bash

# Script para subir archivos de ChurchAI al repositorio GitHub
# Ejecutar desde: /home/jereachilles/churchai-project

echo "=== Inicializando repositorio Git ==="

# Inicializar git si no existe
if [ ! -d .git ]; then
    git init
    echo "Repositorio Git inicializado"
else
    echo "Repositorio Git ya existe"
fi

# Configurar remote (si no existe)
if ! git remote | grep -q origin; then
    git remote add origin https://github.com/JeremiasdDuhalde-Achilles/ChurchAI.git
    echo "Remote 'origin' agregado"
else
    echo "Remote 'origin' ya existe"
    git remote set-url origin https://github.com/JeremiasdDuhalde-Achilles/ChurchAI.git
fi

# Crear .gitignore si no existe
if [ ! -f .gitignore ]; then
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
*.egg-info/
dist/
build/

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker
*.log

# Database
*.db
*.sqlite
*.sqlite3

# Logs
logs/
*.log
EOF
    echo ".gitignore creado"
fi

# Agregar todos los archivos
echo "=== Agregando archivos ==="
git add .

# Mostrar status
echo "=== Status del repositorio ==="
git status

echo ""
echo "=== Siguiente paso ==="
echo "Ejecuta los siguientes comandos:"
echo ""
echo "  git commit -m 'Initial commit: ChurchAI project'"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "Si el repositorio remoto ya tiene contenido, usa:"
echo "  git pull origin main --rebase"
echo "  git push -u origin main"
