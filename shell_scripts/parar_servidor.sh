#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      PARAR SERVIDOR DO CHATBOT FARENSE             ${NC}"
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
    echo -e "${YELLOW}Servidor do Chatbot Farense encontrado em execução (PID: $PID).${NC}"
    echo -e "${YELLOW}A parar o servidor...${NC}"
    
    # Tentar parar o servidor de forma limpa
    kill $PID
    
    # Verificar se o servidor foi parado
    sleep 1
    if ps -p $PID > /dev/null; then
        echo -e "${RED}Não foi possível parar o servidor de forma limpa.${NC}"
        echo -e "${YELLOW}A tentar forçar o encerramento...${NC}"
        
        # Forçar o encerramento
        kill -9 $PID
        
        # Verificar novamente
        sleep 1
        if ps -p $PID > /dev/null; then
            echo -e "${RED}Não foi possível parar o servidor.${NC}"
            echo -e "${RED}Por favor, encerre o processo manualmente.${NC}"
            exit 1
        else
            echo -e "${GREEN}Servidor encerrado com sucesso (forçado).${NC}"
        fi
    else
        echo -e "${GREEN}Servidor encerrado com sucesso.${NC}"
    fi
else
    # Verificar se há outro processo na porta 3000
    if command -v lsof &> /dev/null; then
        OUTRO_PROCESSO=$(lsof -i :3000)
        if [ ! -z "$OUTRO_PROCESSO" ]; then
            echo -e "${YELLOW}Nenhum servidor do Chatbot Farense encontrado, mas a porta 3000 está em uso:${NC}"
            echo "$OUTRO_PROCESSO"
            echo ""
            echo -e "${YELLOW}Deseja tentar parar este processo? (s/n)${NC}"
            read -p "Opção: " parar_processo
            
            if [[ "$parar_processo" =~ ^[Ss]$ ]]; then
                OUTRO_PID=$(echo "$OUTRO_PROCESSO" | grep -v "COMMAND" | awk '{print $2}' | head -n 1)
                if [ ! -z "$OUTRO_PID" ]; then
                    echo -e "${YELLOW}A tentar parar o processo com PID $OUTRO_PID...${NC}"
                    kill $OUTRO_PID
                    sleep 1
                    if ! lsof -i :3000 > /dev/null; then
                        echo -e "${GREEN}Processo parado com sucesso.${NC}"
                    else
                        echo -e "${RED}Não foi possível parar o processo.${NC}"
                        echo -e "${RED}Por favor, encerre o processo manualmente.${NC}"
                    fi
                fi
            else
                echo -e "${YELLOW}Operação cancelada pelo utilizador.${NC}"
            fi
        else
            echo -e "${YELLOW}Nenhum servidor do Chatbot Farense encontrado em execução.${NC}"
        fi
    else
        echo -e "${YELLOW}Nenhum servidor do Chatbot Farense encontrado em execução.${NC}"
    fi
fi

echo -e "${GREEN}Operação concluída.${NC}" 