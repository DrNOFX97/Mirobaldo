#!/bin/bash

# Script de instalação para o Requirements Updater
# Este script instala os scripts de atualização de requirements num projeto

# Definir cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Instalador do Requirements Updater ===${NC}"

# Verificar se o diretório de destino foi fornecido
if [ "$1" == "" ]; then
    # Se não foi fornecido, usar o diretório atual
    DEST_DIR="."
else
    # Usar o diretório fornecido
    DEST_DIR="$1"
fi

# Verificar se o diretório de destino existe
if [ ! -d "$DEST_DIR" ]; then
    echo -e "${YELLOW}O diretório $DEST_DIR não existe. Deseja criá-lo? (s/n)${NC}"
    read -r choice
    if [ "$choice" == "s" ] || [ "$choice" == "S" ]; then
        mkdir -p "$DEST_DIR"
    else
        echo -e "${RED}Instalação cancelada.${NC}"
        exit 1
    fi
fi

# Obter o diretório do script atual
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copiar os scripts para o diretório de destino
echo -e "${YELLOW}A copiar scripts para $DEST_DIR...${NC}"
cp "$SCRIPT_DIR/update_requirements.py" "$DEST_DIR/"
cp "$SCRIPT_DIR/auto_update_requirements.py" "$DEST_DIR/"
cp "$SCRIPT_DIR/update_dependencies.sh" "$DEST_DIR/"
cp "$SCRIPT_DIR/README_requirements_updater.md" "$DEST_DIR/"

# Tornar os scripts executáveis
echo -e "${YELLOW}A tornar os scripts executáveis...${NC}"
chmod +x "$DEST_DIR/update_requirements.py"
chmod +x "$DEST_DIR/auto_update_requirements.py"
chmod +x "$DEST_DIR/update_dependencies.sh"

# Verificar se as dependências estão instaladas
echo -e "${YELLOW}A verificar dependências...${NC}"
MISSING_DEPS=0

# Verificar Python
if ! command -v python &> /dev/null; then
    echo -e "${RED}Python não está instalado. Por favor, instale o Python 3.6 ou superior.${NC}"
    MISSING_DEPS=1
fi

# Verificar pip
if ! command -v pip &> /dev/null; then
    echo -e "${RED}pip não está instalado. Por favor, instale o pip.${NC}"
    MISSING_DEPS=1
fi

# Se todas as dependências estiverem instaladas, oferecer para instalá-las
if [ $MISSING_DEPS -eq 0 ]; then
    echo -e "${YELLOW}Deseja instalar as dependências Python necessárias? (s/n)${NC}"
    read -r choice
    if [ "$choice" == "s" ] || [ "$choice" == "S" ]; then
        echo -e "${YELLOW}A instalar dependências...${NC}"
        pip install requests packaging tqdm
    fi
fi

echo -e "${GREEN}=== Instalação concluída! ===${NC}"
echo -e "${BLUE}Os scripts foram instalados em $DEST_DIR${NC}"
echo -e "${BLUE}Para mais informações, consulte o ficheiro README_requirements_updater.md${NC}"

# Mostrar instruções de uso
echo -e "${YELLOW}Instruções de uso:${NC}"
echo -e "${GREEN}1. Para atualizar interativamente:${NC}"
echo -e "   python $DEST_DIR/update_requirements.py"
echo -e "${GREEN}2. Para atualizar automaticamente:${NC}"
echo -e "   python $DEST_DIR/auto_update_requirements.py -v"
echo -e "${GREEN}3. Para integrar com CI/CD:${NC}"
echo -e "   $DEST_DIR/update_dependencies.sh"

exit 0 