#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      STATUS DO SERVIDOR DO CHATBOT FARENSE         ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Verificar se o servidor está em execução
SERVIDOR_EM_EXECUCAO=false
PID=""

# Método 1: verificar processo específico
if pgrep -f "node src/server.js" > /dev/null; then
    SERVIDOR_EM_EXECUCAO=true
    PID=$(pgrep -f "node src/server.js")
fi

# Método 2: verificar se há algum processo Node.js na porta 3000
if [ "$SERVIDOR_EM_EXECUCAO" = false ] && command -v lsof &> /dev/null; then
    NODE_NA_PORTA=$(lsof -i :3000 | grep "node")
    if [ ! -z "$NODE_NA_PORTA" ]; then
        SERVIDOR_EM_EXECUCAO=true
        PID=$(echo "$NODE_NA_PORTA" | awk '{print $2}' | head -n 1)
    fi
fi

if [ "$SERVIDOR_EM_EXECUCAO" = true ] && [ ! -z "$PID" ]; then
    # Obter informações sobre o processo
    TEMPO_EXECUCAO=$(ps -p $PID -o etime= | tr -d ' ')
    USO_CPU=$(ps -p $PID -o %cpu= | tr -d ' ')
    USO_MEM=$(ps -p $PID -o %mem= | tr -d ' ')
    
    echo -e "${GREEN}✓ Servidor do Chatbot Farense está em execução${NC}"
    echo -e "${YELLOW}PID:${NC} $PID"
    echo -e "${YELLOW}Tempo de execução:${NC} $TEMPO_EXECUCAO"
    echo -e "${YELLOW}Uso de CPU:${NC} $USO_CPU%"
    echo -e "${YELLOW}Uso de memória:${NC} $USO_MEM%"
    echo -e "${YELLOW}URL do Chatbot:${NC} http://localhost:3000"
    
    # Verificar se o servidor está respondendo
    echo -e "${YELLOW}A verificar se o servidor está respondendo...${NC}"
    if command -v curl &> /dev/null; then
        RESPOSTA=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
        if [ "$RESPOSTA" = "200" ]; then
            echo -e "${GREEN}✓ Servidor está respondendo corretamente (HTTP 200 OK)${NC}"
        else
            echo -e "${RED}✗ Servidor não está respondendo corretamente (HTTP $RESPOSTA)${NC}"
        fi
    else
        echo -e "${YELLOW}Comando curl não encontrado. Não foi possível verificar se o servidor está respondendo.${NC}"
    fi
    
    # Mostrar comandos úteis
    echo ""
    echo -e "${BLUE}Comandos úteis:${NC}"
    echo -e "${YELLOW}Para parar o servidor:${NC} ./parar_servidor.sh"
    echo -e "${YELLOW}Para reiniciar o servidor:${NC} ./reiniciar_servidor.sh"
else
    # Verificar se há outro processo na porta 3000
    if command -v lsof &> /dev/null; then
        OUTRO_PROCESSO=$(lsof -i :3000)
        if [ ! -z "$OUTRO_PROCESSO" ]; then
            echo -e "${RED}✗ Servidor do Chatbot Farense não está em execução${NC}"
            echo -e "${RED}✗ A porta 3000 está em uso por outro processo:${NC}"
            echo "$OUTRO_PROCESSO"
            echo ""
            echo -e "${YELLOW}Para iniciar o servidor, primeiro libere a porta 3000.${NC}"
        else
            echo -e "${RED}✗ Servidor do Chatbot Farense não está em execução${NC}"
            echo ""
            echo -e "${BLUE}Comandos úteis:${NC}"
            echo -e "${YELLOW}Para iniciar o servidor:${NC} ./start_chatbot.sh"
            echo -e "${YELLOW}Para verificar a integridade do sistema:${NC} ./verificar_sistema.sh"
        fi
    else
        echo -e "${RED}✗ Servidor do Chatbot Farense não está em execução${NC}"
        echo ""
        echo -e "${BLUE}Comandos úteis:${NC}"
        echo -e "${YELLOW}Para iniciar o servidor:${NC} ./start_chatbot.sh"
        echo -e "${YELLOW}Para verificar a integridade do sistema:${NC} ./verificar_sistema.sh"
    fi
fi 