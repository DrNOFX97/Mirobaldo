#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      CHATBOT FARENSE - SISTEMA DE INICIALIZAÇÃO    ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""
echo -e "${YELLOW}Bem-vindo ao sistema de inicialização do Chatbot Farense!${NC}"
echo ""
echo -e "Por favor, escolha uma opção:"
echo -e "${GREEN}1)${NC} Iniciar apenas o Chatbot (Node.js)"
echo -e "${GREEN}2)${NC} Configurar ambiente Python e iniciar Chatbot"
echo -e "${GREEN}3)${NC} Verificar integridade do sistema"
echo -e "${GREEN}4)${NC} Verificar status do servidor"
echo -e "${GREEN}5)${NC} Parar o servidor do Chatbot"
echo -e "${GREEN}6)${NC} Reiniciar o servidor do Chatbot"
echo -e "${GREEN}7)${NC} Abrir Chatbot no navegador"
echo -e "${GREEN}8)${NC} Sair"
echo ""
read -p "Opção [1-8]: " opcao

case $opcao in
    1)
        echo -e "${YELLOW}A iniciar o Chatbot Farense...${NC}"
        ./start_chatbot.sh
        ;;
    2)
        echo -e "${YELLOW}A configurar ambiente Python...${NC}"
        ./setup_python_env.sh
        echo -e "${YELLOW}Ambiente Python configurado. A iniciar o Chatbot Farense...${NC}"
        ./start_chatbot.sh
        ;;
    3)
        echo -e "${YELLOW}A verificar integridade do sistema...${NC}"
        ./verificar_sistema.sh
        ;;
    4)
        echo -e "${YELLOW}A verificar status do servidor...${NC}"
        ./status_servidor.sh
        ;;
    5)
        echo -e "${YELLOW}A parar o servidor do Chatbot...${NC}"
        ./parar_servidor.sh
        ;;
    6)
        echo -e "${YELLOW}A reiniciar o servidor do Chatbot...${NC}"
        ./reiniciar_servidor.sh
        ;;
    7)
        echo -e "${YELLOW}A abrir o Chatbot no navegador...${NC}"
        ./abrir_navegador.sh
        ;;
    8)
        echo -e "${YELLOW}A sair do sistema de inicialização. Até breve!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida. Por favor, execute novamente e escolha uma opção válida.${NC}"
        exit 1
        ;;
esac 