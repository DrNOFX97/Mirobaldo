#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      ABRIR CHATBOT FARENSE NO NAVEGADOR            ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Verificar se o servidor está em execução
if ! pgrep -f "node src/server.js" > /dev/null; then
    echo -e "${RED}O servidor do Chatbot Farense não está em execução.${NC}"
    echo -e "${YELLOW}Deseja iniciar o servidor antes de abrir o navegador? (s/n)${NC}"
    read -p "Opção: " iniciar_servidor
    
    if [[ "$iniciar_servidor" =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}A iniciar o servidor...${NC}"
        ./start_chatbot.sh &
        
        # Aguardar o servidor iniciar
        echo -e "${YELLOW}Aguardando o servidor iniciar...${NC}"
        sleep 3
        
        if ! pgrep -f "node src/server.js" > /dev/null; then
            echo -e "${RED}Não foi possível iniciar o servidor.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}O navegador será aberto, mas o chatbot pode não estar disponível.${NC}"
    fi
fi

# URL do chatbot
URL="http://localhost:3000"

echo -e "${YELLOW}A abrir o Chatbot Farense no navegador padrão...${NC}"

# Detectar o sistema operacional e abrir o navegador
case "$(uname -s)" in
    Darwin*)    # macOS
        open "$URL"
        ;;
    Linux*)     # Linux
        if command -v xdg-open > /dev/null; then
            xdg-open "$URL"
        elif command -v gnome-open > /dev/null; then
            gnome-open "$URL"
        else
            echo -e "${RED}Não foi possível detectar um comando para abrir o navegador.${NC}"
            echo -e "${YELLOW}Por favor, abra manualmente o seguinte URL:${NC}"
            echo -e "$URL"
            exit 1
        fi
        ;;
    CYGWIN*|MINGW*|MSYS*)  # Windows
        start "$URL"
        ;;
    *)
        echo -e "${RED}Sistema operacional não suportado.${NC}"
        echo -e "${YELLOW}Por favor, abra manualmente o seguinte URL:${NC}"
        echo -e "$URL"
        exit 1
        ;;
esac

echo -e "${GREEN}Navegador aberto com sucesso!${NC}"
echo -e "${GREEN}O Chatbot Farense está disponível em: $URL${NC}" 