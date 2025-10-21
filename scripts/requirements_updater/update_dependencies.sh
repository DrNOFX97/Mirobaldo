#!/bin/bash

# Script para atualizar as dependências do projeto
# Este script pode ser usado em pipelines de CI/CD para manter as dependências atualizadas

# Definir cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Iniciando atualização de dependências ===${NC}"

# Verificar se Python está instalado
if ! command -v python &> /dev/null; then
    echo -e "${RED}Erro: Python não está instalado.${NC}"
    exit 1
fi

# Verificar se pip está instalado
if ! command -v pip &> /dev/null; then
    echo -e "${RED}Erro: pip não está instalado.${NC}"
    exit 1
fi

# Instalar dependências necessárias
echo -e "${YELLOW}Instalando dependências necessárias...${NC}"
pip install requests packaging --quiet

# Verificar se o script de atualização existe
if [ ! -f "auto_update_requirements.py" ]; then
    echo -e "${RED}Erro: O script auto_update_requirements.py não foi encontrado.${NC}"
    exit 1
fi

# Criar branch para as atualizações (se git estiver disponível)
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo -e "${YELLOW}Criando branch para as atualizações...${NC}"
    BRANCH_NAME="update-dependencies-$(date +%Y%m%d)"
    git checkout -b $BRANCH_NAME
fi

# Executar o script de atualização
echo -e "${YELLOW}Atualizando dependências...${NC}"
python auto_update_requirements.py --no-backup

# Verificar se houve alterações (se git estiver disponível)
if command -v git &> /dev/null && [ -d ".git" ]; then
    if git diff --quiet requirements.txt; then
        echo -e "${GREEN}Nenhuma atualização necessária.${NC}"
        git checkout -
        git branch -D $BRANCH_NAME
        exit 0
    else
        echo -e "${GREEN}Dependências atualizadas com sucesso.${NC}"
        git add requirements.txt
        git commit -m "Atualizar dependências: $(date +%Y-%m-%d)"
        
        # Opcionalmente, fazer push para o repositório remoto
        # git push origin $BRANCH_NAME
        
        echo -e "${GREEN}Branch '$BRANCH_NAME' criada com as atualizações.${NC}"
        echo -e "${YELLOW}Revise as alterações e faça merge manualmente ou configure um pipeline de CI/CD para isso.${NC}"
    fi
else
    echo -e "${GREEN}Dependências atualizadas com sucesso.${NC}"
fi

echo -e "${GREEN}=== Atualização de dependências concluída ===${NC}"
exit 0 