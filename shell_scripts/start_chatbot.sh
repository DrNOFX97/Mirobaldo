#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Iniciando o Chatbot Farense ===${NC}"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não está instalado. Por favor, instale o Node.js para continuar.${NC}"
    echo "Visite https://nodejs.org/ para instruções de instalação."
    exit 1
fi

# Verificar a versão do Node.js
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js versão ${NODE_VERSION} encontrada.${NC}"

# Criar pasta node_modules se não existir
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Pasta node_modules não encontrada. A criar ambiente virtual...${NC}"
    
    # Instalar dependências
    echo -e "${YELLOW}A instalar dependências...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao instalar dependências. Por favor, verifique o log acima.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Dependências instaladas com sucesso!${NC}"
else
    echo -e "${GREEN}Pasta node_modules encontrada.${NC}"
    
    # Verificar se as dependências estão atualizadas
    echo -e "${YELLOW}A verificar se as dependências estão atualizadas...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao atualizar dependências. Por favor, verifique o log acima.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Dependências atualizadas com sucesso!${NC}"
fi

# Verificar se o ficheiro .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Ficheiro .env não encontrado. A criar ficheiro .env padrão...${NC}"
    echo "OPENAI_API_KEY=SUA_CHAVE_DA_OPENAI" > .env
    echo -e "${GREEN}Ficheiro .env criado. Por favor, edite-o e adicione a sua chave da API da OpenAI.${NC}"
    echo -e "${YELLOW}Pressione Enter para continuar ou Ctrl+C para cancelar e editar o ficheiro .env...${NC}"
    read
else
    echo -e "${GREEN}Ficheiro .env encontrado.${NC}"
    
    # Verificar se a chave da API está definida
    if grep -q "SUA_CHAVE_DA_OPENAI" .env; then
        echo -e "${RED}Aviso: Parece que a chave da API da OpenAI não foi configurada no ficheiro .env.${NC}"
        echo -e "${YELLOW}Por favor, edite o ficheiro .env e adicione a sua chave da API da OpenAI.${NC}"
        echo -e "${YELLOW}Pressione Enter para continuar ou Ctrl+C para cancelar e editar o ficheiro .env...${NC}"
        read
    fi
fi

# Verificar se a pasta public existe e se contém a imagem do Mirobaldo
if [ ! -f "public/mirobaldo_chatbot.png" ]; then
    echo -e "${YELLOW}Imagem do Mirobaldo não encontrada em public/mirobaldo_chatbot.png.${NC}"
    echo -e "${YELLOW}O chatbot pode funcionar sem a imagem, mas a experiência visual será afetada.${NC}"
    echo -e "${YELLOW}Pressione Enter para continuar ou Ctrl+C para cancelar...${NC}"
    read
else
    echo -e "${GREEN}Imagem do Mirobaldo encontrada.${NC}"
fi

# Iniciar o servidor
echo -e "${YELLOW}A iniciar o servidor do Chatbot Farense...${NC}"
echo -e "${GREEN}O servidor estará disponível em http://localhost:3000${NC}"
echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor.${NC}"
node src/server.js 