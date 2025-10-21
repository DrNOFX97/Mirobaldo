#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      REINICIAR SERVIDOR DO CHATBOT FARENSE         ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Parar o servidor se estiver em execução
echo -e "${YELLOW}Verificando se o servidor está em execução...${NC}"

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
    echo -e "${YELLOW}Servidor encontrado (PID: $PID). A parar o servidor...${NC}"
    
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
            echo -e "${RED}Por favor, encerre o processo manualmente e tente novamente.${NC}"
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
            echo -e "${YELLOW}Deseja tentar parar este processo antes de iniciar o servidor? (s/n)${NC}"
            read -p "Opção: " parar_processo
            
            if [[ "$parar_processo" =~ ^[Ss]$ ]]; then
                OUTRO_PID=$(echo "$OUTRO_PROCESSO" | grep -v "COMMAND" | awk '{print $2}' | head -n 1)
                if [ ! -z "$OUTRO_PID" ]; then
                    echo -e "${YELLOW}A tentar parar o processo com PID $OUTRO_PID...${NC}"
                    kill $OUTRO_PID
                    sleep 1
                    if lsof -i :3000 > /dev/null; then
                        echo -e "${RED}Não foi possível parar o processo.${NC}"
                        echo -e "${RED}Por favor, encerre o processo manualmente e tente novamente.${NC}"
                        exit 1
                    else
                        echo -e "${GREEN}Processo parado com sucesso.${NC}"
                    fi
                fi
            else
                echo -e "${YELLOW}Operação cancelada pelo utilizador.${NC}"
                exit 0
            fi
        else
            echo -e "${YELLOW}Nenhum servidor encontrado em execução.${NC}"
        fi
    else
        echo -e "${YELLOW}Nenhum servidor encontrado em execução.${NC}"
    fi
fi

# Iniciar o servidor
echo -e "${YELLOW}A iniciar o servidor...${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não está instalado. Por favor, instale o Node.js para continuar.${NC}"
    exit 1
fi

# Verificar se o ficheiro server.js existe
if [ ! -f "src/server.js" ]; then
    echo -e "${RED}Ficheiro src/server.js não encontrado.${NC}"
    exit 1
fi

# Iniciar o servidor em segundo plano
node src/server.js &

# Verificar se o servidor foi iniciado
sleep 2
if pgrep -f "node src/server.js" > /dev/null || (command -v lsof &> /dev/null && lsof -i :3000 | grep "node" > /dev/null); then
    echo -e "${GREEN}Servidor reiniciado com sucesso!${NC}"
    echo -e "${GREEN}O Chatbot Farense está disponível em: http://localhost:3000${NC}"
else
    echo -e "${RED}Não foi possível iniciar o servidor.${NC}"
    echo -e "${RED}Verifique os logs para mais informações.${NC}"
    exit 1
fi 