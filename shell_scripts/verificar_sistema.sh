#!/bin/bash

# Cores para melhor visualização
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}      VERIFICAÇÃO DO SISTEMA CHATBOT FARENSE        ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Função para verificar se um diretório existe
verificar_diretorio() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓ Diretório $1 encontrado${NC}"
        return 0
    else
        echo -e "${RED}✗ Diretório $1 não encontrado${NC}"
        return 1
    fi
}

# Função para verificar se um ficheiro existe
verificar_ficheiro() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓ Ficheiro $1 encontrado${NC}"
        return 0
    else
        echo -e "${RED}✗ Ficheiro $1 não encontrado${NC}"
        return 1
    fi
}

# Função para verificar se um comando está disponível
verificar_comando() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓ Comando $1 encontrado${NC}"
        return 0
    else
        echo -e "${RED}✗ Comando $1 não encontrado${NC}"
        return 1
    fi
}

# Verificar estrutura de diretórios
echo -e "${YELLOW}Verificando estrutura de diretórios...${NC}"
erros_diretorios=0

diretorios=("src" "src/agents" "public" "dados")
for dir in "${diretorios[@]}"; do
    if ! verificar_diretorio "$dir"; then
        erros_diretorios=$((erros_diretorios+1))
    fi
done

if [ $erros_diretorios -eq 0 ]; then
    echo -e "${GREEN}Todos os diretórios necessários estão presentes.${NC}"
else
    echo -e "${RED}Faltam $erros_diretorios diretório(s) necessário(s).${NC}"
fi
echo ""

# Verificar ficheiros essenciais
echo -e "${YELLOW}Verificando ficheiros essenciais...${NC}"
erros_ficheiros=0

ficheiros=(
    "src/server.js" 
    "public/index.html" 
    "public/styles.css" 
    "public/client.js" 
    "public/mirobaldo_chatbot.png"
    "package.json"
    ".env"
    "start_chatbot.sh"
    "iniciar.sh"
)

for ficheiro in "${ficheiros[@]}"; do
    if ! verificar_ficheiro "$ficheiro"; then
        erros_ficheiros=$((erros_ficheiros+1))
    fi
done

if [ $erros_ficheiros -eq 0 ]; then
    echo -e "${GREEN}Todos os ficheiros essenciais estão presentes.${NC}"
else
    echo -e "${RED}Faltam $erros_ficheiros ficheiro(s) essencial(is).${NC}"
fi
echo ""

# Verificar agentes
echo -e "${YELLOW}Verificando agentes...${NC}"
erros_agentes=0

agentes=(
    "src/agents/biografiasAgent.js"
    "src/agents/classificacoesAgent.js"
    "src/agents/fundacaoAgent.js"
    "src/agents/jogadoresAgent.js"
    "src/agents/livrosAgent.js"
    "src/agents/presidentesAgent.js"
    "src/agents/resultadosAgent.js"
)

for agente in "${agentes[@]}"; do
    if ! verificar_ficheiro "$agente"; then
        erros_agentes=$((erros_agentes+1))
    fi
done

if [ $erros_agentes -eq 0 ]; then
    echo -e "${GREEN}Todos os agentes estão presentes.${NC}"
else
    echo -e "${RED}Faltam $erros_agentes agente(s).${NC}"
fi
echo ""

# Verificar dados
echo -e "${YELLOW}Verificando ficheiros de dados...${NC}"
erros_dados=0

dados=(
    "dados/presidentes.txt"
    "dados/resultados.txt"
    "dados/classificacoes.txt"
    "dados/equipas.txt"
    "dados/bio_joao_gralho.txt"
    "dados/bio_paco_fortes_formatado.md"
    "dados/bio_hassan_nader_formatado.md"
)

for dado in "${dados[@]}"; do
    if ! verificar_ficheiro "$dado"; then
        erros_dados=$((erros_dados+1))
    fi
done

if [ $erros_dados -eq 0 ]; then
    echo -e "${GREEN}Todos os ficheiros de dados estão presentes.${NC}"
else
    echo -e "${RED}Faltam $erros_dados ficheiro(s) de dados.${NC}"
fi
echo ""

# Verificar dependências do sistema
echo -e "${YELLOW}Verificando dependências do sistema...${NC}"
erros_deps=0

if ! verificar_comando "node"; then
    erros_deps=$((erros_deps+1))
else
    node_version=$(node -v)
    echo -e "${GREEN}Versão do Node.js: $node_version${NC}"
fi

if ! verificar_comando "npm"; then
    erros_deps=$((erros_deps+1))
else
    npm_version=$(npm -v)
    echo -e "${GREEN}Versão do npm: $npm_version${NC}"
fi

# Verificar se o node_modules existe e tem conteúdo
if [ -d "node_modules" ] && [ "$(ls -A node_modules)" ]; then
    echo -e "${GREEN}✓ Dependências Node.js instaladas${NC}"
else
    echo -e "${RED}✗ Dependências Node.js não instaladas ou incompletas${NC}"
    erros_deps=$((erros_deps+1))
fi

if [ $erros_deps -eq 0 ]; then
    echo -e "${GREEN}Todas as dependências do sistema estão presentes.${NC}"
else
    echo -e "${RED}Faltam $erros_deps dependência(s) do sistema.${NC}"
fi
echo ""

# Verificar permissões de execução dos scripts
echo -e "${YELLOW}Verificando permissões de execução dos scripts...${NC}"
erros_perms=0

scripts=(
    "start_chatbot.sh" 
    "setup_python_env.sh" 
    "iniciar.sh"
    "parar_servidor.sh"
    "reiniciar_servidor.sh"
    "status_servidor.sh"
    "abrir_navegador.sh"
    "verificar_sistema.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo -e "${GREEN}✓ Script $script tem permissão de execução${NC}"
        else
            echo -e "${RED}✗ Script $script não tem permissão de execução${NC}"
            erros_perms=$((erros_perms+1))
        fi
    else
        echo -e "${RED}✗ Script $script não encontrado${NC}"
        erros_perms=$((erros_perms+1))
    fi
done

if [ $erros_perms -eq 0 ]; then
    echo -e "${GREEN}Todos os scripts têm permissões de execução.${NC}"
else
    echo -e "${RED}$erros_perms script(s) não têm permissões de execução ou não foram encontrados.${NC}"
    echo -e "${YELLOW}Execute o seguinte comando para corrigir as permissões:${NC}"
    echo -e "chmod +x *.sh"
fi
echo ""

# Resumo final
total_erros=$((erros_diretorios + erros_ficheiros + erros_agentes + erros_dados + erros_deps + erros_perms))

echo -e "${BLUE}====================================================${NC}"
echo -e "${YELLOW}RESUMO DA VERIFICAÇÃO:${NC}"
if [ $total_erros -eq 0 ]; then
    echo -e "${GREEN}✓ Sistema íntegro! Todos os componentes verificados estão presentes e configurados corretamente.${NC}"
    echo -e "${GREEN}✓ O Chatbot Farense está pronto para ser iniciado.${NC}"
    echo -e "${YELLOW}Para iniciar o chatbot, execute:${NC}"
    echo -e "./iniciar.sh"
else
    echo -e "${RED}✗ Foram encontrados $total_erros problema(s) no sistema.${NC}"
    echo -e "${YELLOW}Por favor, corrija os problemas indicados acima antes de iniciar o chatbot.${NC}"
fi
echo -e "${BLUE}====================================================${NC}" 