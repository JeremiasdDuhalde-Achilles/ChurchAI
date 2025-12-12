#!/bin/bash

echo "Arreglando Docker Compose..."

# Desinstalar la versión problemática de pip
echo "Desinstalando Docker Compose de pip..."
pip3 uninstall docker-compose -y

# Instalar la versión oficial de Docker Compose
echo "Instalando Docker Compose oficial..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Hacer ejecutable
sudo chmod +x /usr/local/bin/docker-compose

# Crear symlink para compatibilidad
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verificar instalación
echo "Verificando instalación..."
docker-compose --version

# Agregar usuario al grupo docker si no está
if ! groups $USER | grep -q '\bdocker\b'; then
    echo "Agregando usuario al grupo docker..."
    sudo usermod -aG docker $USER
    echo "Ejecuta: newgrp docker"
fi

echo "Docker Compose arreglado!"
