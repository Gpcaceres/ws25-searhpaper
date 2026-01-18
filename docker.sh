#!/bin/bash

# Script para gestionar la aplicación SearchPaper con Docker

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detectar versión de Docker Compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${BLUE}Usando Docker Compose V1${NC}"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${BLUE}Usando Docker Compose V2${NC}"
else
    echo -e "${RED}Error: Docker Compose no está instalado${NC}"
    exit 1
fi

# Función de ayuda
show_help() {
    echo -e "${GREEN}SearchPaper - Gestión con Docker${NC}"
    echo ""
    echo "Uso: ./docker.sh [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start      - Construir e iniciar los contenedores"
    echo "  stop       - Detener los contenedores"
    echo "  restart    - Reiniciar los contenedores"
    echo "  logs       - Ver logs en tiempo real"
    echo "  status     - Ver estado de los contenedores"
    echo "  clean      - Detener y eliminar contenedores, volúmenes e imágenes"
    echo "  build      - Reconstruir las imágenes"
    echo "  help       - Mostrar esta ayuda"
    echo ""
}

# Función para iniciar
start() {
    echo -e "${GREEN}Iniciando SearchPaper...${NC}"
    $DOCKER_COMPOSE up --build -d
    echo -e "${GREEN}✓ Aplicación iniciada${NC}"
    echo -e "${BLUE}Frontend: http://localhost:8080${NC}"
    echo -e "${BLUE}Backend API: http://localhost:3000${NC}"
}

# Función para detener
stop() {
    echo -e "${GREEN}Deteniendo SearchPaper...${NC}"
    $DOCKER_COMPOSE down
    echo -e "${GREEN}✓ Aplicación detenida${NC}"
}

# Función para reiniciar
restart() {
    echo -e "${GREEN}Reiniciando SearchPaper...${NC}"
    $DOCKER_COMPOSE restart
    echo -e "${GREEN}✓ Aplicación reiniciada${NC}"
}

# Función para ver logs
logs() {
    echo -e "${GREEN}Mostrando logs... (Ctrl+C para salir)${NC}"
    $DOCKER_COMPOSE logs -f
}

# Función para ver estado
status() {
    echo -e "${GREEN}Estado de los contenedores:${NC}"
    $DOCKER_COMPOSE ps
}

# Función para limpiar
clean() {
    echo -e "${RED}¿Está seguro de eliminar todos los contenedores, volúmenes e imágenes? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${GREEN}Limpiando...${NC}"
        $DOCKER_COMPOSE down -v --rmi all
        echo -e "${GREEN}✓ Limpieza completada${NC}"
    else
        echo -e "${BLUE}Operación cancelada${NC}"
    fi
}

# Función para reconstruir
build() {
    echo -e "${GREEN}Reconstruyendo imágenes...${NC}"
    $DOCKER_COMPOSE build --no-cache
    echo -e "${GREEN}✓ Imágenes reconstruidas${NC}"
}

# Main
case "${1}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    build)
        build
        ;;
    help|*)
        show_help
        ;;
esac
