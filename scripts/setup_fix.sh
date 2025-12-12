#!/bin/bash

echo "🔧 Solucionando problemas de Docker..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "Instalando Docker..."
    
    # Actualizar repositorios
    sudo apt update
    
    # Instalar dependencias
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Agregar clave GPG de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Agregar repositorio
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    echo "✅ Docker instalado"
fi

# Verificar si el usuario está en el grupo docker
if ! groups $USER | grep -q '\bdocker\b'; then
    echo "👤 Agregando usuario al grupo docker..."
    sudo usermod -aG docker $USER
    echo "⚠️ Debes cerrar sesión y volver a entrar para que los cambios surtan efecto"
    echo "O ejecutar: newgrp docker"
fi

# Iniciar servicio Docker
echo "🚀 Iniciando servicio Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Verificar estado
echo "📊 Estado de Docker:"
sudo systemctl status docker --no-pager

# Probar Docker
echo "🧪 Probando Docker..."
if sudo docker run hello-world; then
    echo "✅ Docker funciona correctamente"
else
    echo "❌ Docker aún tiene problemas"
fi

# Instalar Docker Compose si no está
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Instalando Docker Compose..."
    
    # Método 1: Usando pip (más confiable)
    sudo apt install -y python3-pip
    pip3 install docker-compose
    
    # Agregar al PATH si es necesario
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/.local/bin:$PATH"
    
    echo "✅ Docker Compose instalado"
fi

# Verificar versiones
echo "📋 Versiones instaladas:"
docker --version
docker-compose --version

echo ""
echo "🎯 Próximos pasos:"
echo "1. Si agregamos tu usuario al grupo docker, ejecuta: newgrp docker"
echo "2. Luego ejecuta: ./start.sh"
echo "3. Si sigues teniendo problemas, usa sudo: sudo docker-compose up --build -d"
