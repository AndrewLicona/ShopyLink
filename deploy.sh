#!/bin/bash

# ShopyLink - Script de Despliegue Automatizado
# ==============================================

set -e  # Salir inmediatamente si un comando falla

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

# Símbolos
ROCKET="🚀"
CHECK="✓"
CROSS="✗"
GEAR="⚙️"
PACKAGE="📦"
CLOCK="⏱️"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ShopyLink - Despliegue Automatizado${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Función para mostrar mensajes con timestamp
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[${CHECK}]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[${CROSS}]${NC} $1"
}

# Confirmar con el usuario
echo -e "${YELLOW}${ROCKET} ¿Estás seguro de que deseas desplegar los últimos cambios?${NC}"
echo -e "${YELLOW}   Esto hará pull, reconstruirá y reiniciará los contenedores Docker.${NC}"
read -p "   Presiona [Enter] para continuar o [Ctrl+C] para cancelar..."
echo ""

# 1. Git Pull
log_info "${PACKAGE} Obteniendo últimos cambios desde el repositorio..."
if git pull origin main; then
    log_success "Cambios descargados exitosamente"
else
    log_error "Error al hacer git pull. Revisa conflictos o problemas de red."
    exit 1
fi
echo ""

# 2. Detener contenedores existentes
log_info "${GEAR} Deteniendo contenedores actuales..."
if docker compose down; then
    log_success "Contenedores detenidos"
else
    log_warning "No había contenedores ejecutándose o hubo un error menor"
fi
echo ""

# 3. Reconstruir contenedores en el servidor
log_info "${PACKAGE} Reconstruyendo imágenes Docker localmente (esto puede tomar varios minutos)..."
if docker compose build --no-cache; then
    log_success "Imágenes reconstruidas exitosamente"
else
    log_error "Error al reconstruir las imágenes Docker"
    exit 1
fi
echo ""

# 4. Iniciar contenedores
log_info "${ROCKET} Iniciando servicios..."
if docker compose up -d; then
    log_success "Servicios iniciados en modo detached"
else
    log_error "Error al iniciar los servicios"
    exit 1
fi
echo ""

# 5. Verificar estado
log_info "${CLOCK} Verificando estado de los contenedores..."
sleep 3
docker compose ps
echo ""

# 6. Mostrar logs recientes
log_info "Últimas líneas de los logs:"
docker compose logs --tail=20
echo ""

# Mensaje final
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ${CHECK} Despliegue completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Comandos útiles:${NC}"
echo -e "  ${YELLOW}•${NC} Ver logs en tiempo real:  ${BLUE}docker compose logs -f${NC}"
echo -e "  ${YELLOW}•${NC} Verificar estado:         ${BLUE}docker compose ps${NC}"
echo -e "  ${YELLOW}•${NC} Reiniciar servicios:      ${BLUE}docker compose restart${NC}"
echo -e "  ${YELLOW}•${NC} Detener todo:             ${BLUE}docker compose down${NC}"
echo ""
