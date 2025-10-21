#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Configurando Ambiente Python para o Chatbot Farense ===${NC}"

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 não está instalado. Por favor, instale o Python 3 para continuar.${NC}"
    echo "Visite https://www.python.org/ para instruções de instalação."
    exit 1
fi

# Verificar a versão do Python
PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}${PYTHON_VERSION} encontrado.${NC}"

# Verificar se o virtualenv está instalado
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}pip3 não está instalado. Por favor, instale o pip3 para continuar.${NC}"
    exit 1
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Ambiente virtual não encontrado. A criar ambiente virtual...${NC}"
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao criar ambiente virtual. Tentando com virtualenv...${NC}"
        
        # Verificar se o virtualenv está instalado
        if ! command -v virtualenv &> /dev/null; then
            echo -e "${YELLOW}virtualenv não está instalado. A instalar virtualenv...${NC}"
            pip3 install virtualenv
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}Erro ao instalar virtualenv. Por favor, instale manualmente com 'pip3 install virtualenv'.${NC}"
                exit 1
            fi
        fi
        
        # Criar ambiente virtual com virtualenv
        virtualenv venv
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Erro ao criar ambiente virtual com virtualenv. Por favor, verifique o log acima.${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}Ambiente virtual criado com sucesso!${NC}"
else
    echo -e "${GREEN}Ambiente virtual encontrado.${NC}"
fi

# Ativar ambiente virtual
echo -e "${YELLOW}A ativar ambiente virtual...${NC}"
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao ativar ambiente virtual. Por favor, verifique o log acima.${NC}"
    exit 1
fi

echo -e "${GREEN}Ambiente virtual ativado com sucesso!${NC}"

# Instalar dependências Python
echo -e "${YELLOW}A instalar dependências Python...${NC}"

# Criar requirements.txt se não existir
if [ ! -f "requirements_python.txt" ]; then
    echo -e "${YELLOW}Ficheiro requirements_python.txt não encontrado. A criar ficheiro padrão...${NC}"
    cat > requirements_python.txt << EOF
openai>=1.0.0
python-dotenv>=1.0.0
pandas>=2.0.0
matplotlib>=3.0.0
numpy>=1.20.0
requests>=2.25.0
EOF
    echo -e "${GREEN}Ficheiro requirements_python.txt criado.${NC}"
fi

# Instalar dependências
pip3 install -r requirements_python.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao instalar dependências Python. Por favor, verifique o log acima.${NC}"
    exit 1
fi

echo -e "${GREEN}Dependências Python instaladas com sucesso!${NC}"
echo -e "${YELLOW}Ambiente Python configurado e pronto para uso.${NC}"
echo -e "${GREEN}Para ativar o ambiente virtual, execute: source venv/bin/activate${NC}"
echo -e "${GREEN}Para desativar o ambiente virtual, execute: deactivate${NC}"

# Manter o ambiente virtual ativo
echo -e "${YELLOW}O ambiente virtual está ativo. Pode executar comandos Python agora.${NC}"
echo -e "${YELLOW}Pressione Ctrl+D para sair do ambiente virtual.${NC}"
$SHELL 