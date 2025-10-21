# Guia de Utilização - Chatbot Farense

## 🚀 Início Rápido

### Pré-requisitos
- Node.js v14 ou superior
- npm v6 ou superior
- Python 3.8+ (opcional)
- Chave API da OpenAI

### 1. Configuração Inicial

1. **Configure a chave API da OpenAI**
   - Edite o ficheiro `config/.env`
   - Adicione a sua chave: `OPENAI_API_KEY=sua_chave_aqui`

2. **Instale as dependências**
   ```bash
   npm install
   ```

### 2. Iniciar o Chatbot

**Método 1: Menu Interativo (Recomendado)**
```bash
./shell_scripts/iniciar.sh
```

Opções disponíveis:
1. Iniciar apenas o Chatbot (Node.js)
2. Configurar ambiente Python e iniciar Chatbot
3. Verificar integridade do sistema
4. Verificar status do servidor
5. Parar o servidor do Chatbot
6. Reiniciar o servidor do Chatbot
7. Abrir Chatbot no navegador
8. Sair

**Método 2: Inicialização Direta**
```bash
./shell_scripts/start_chatbot.sh
```

**Método 3: Usar npm**
```bash
npm start
```

### 3. Aceder ao Chatbot

Após iniciar o servidor:
- Abrir navegador em: http://localhost:3000
- Ou executar: `./shell_scripts/abrir_navegador.sh`

---

## 📚 Como Usar o Chatbot

### Tipos de Perguntas Suportadas

#### 1. História e Fundação
```
- "Quando foi fundado o Farense?"
- "Qual é a história do clube?"
- "Como nasceu o Sporting Clube Farense?"
```

#### 2. Biografias
```
- "Quem foi Paco Fortes?"
- "Fala-me sobre Hassan Nader"
- "Quem é António Gago?"
- "Conta-me sobre João Gralho"
```

#### 3. Jogadores
```
- "Quem são os jogadores históricos do Farense?"
- "Quais os melhores jogadores que passaram pelo clube?"
- "Que jogadores marcaram a história do Farense?"
```

#### 4. Classificações
```
- "Qual foi a melhor classificação do Farense?"
- "Em que ano o Farense ficou melhor classificado?"
- "Como está o Farense na tabela?"
```

#### 5. Resultados
```
- "Quais foram os maiores resultados do Farense?"
- "Que jogos importantes o Farense ganhou?"
- "Resultados históricos do Farense"
```

#### 6. Presidentes
```
- "Quem foram os presidentes do Farense?"
- "Quem é o presidente atual?"
- "História dos presidentes do clube"
```

#### 7. Livros
```
- "Que livros existem sobre o Farense?"
- "Literatura sobre o Sporting Clube Farense"
```

### Dicas para Melhores Respostas

✅ **Faça perguntas específicas**
- ❌ "Conta-me tudo"
- ✅ "Qual foi a melhor época do Farense na primeira divisão?"

✅ **Use linguagem natural**
- O chatbot entende português de Portugal
- Pode usar expressões coloquiais

✅ **Explore diferentes tópicos**
- O chatbot tem conhecimento vasto sobre o clube
- Pode fazer perguntas de seguimento

---

## 🛠️ Gestão do Servidor

### Ver Status
```bash
./shell_scripts/status_servidor.sh
```
Mostra se o servidor está a correr e em que porta.

### Parar Servidor
```bash
./shell_scripts/parar_servidor.sh
```
Para o servidor do chatbot de forma segura.

### Reiniciar Servidor
```bash
./shell_scripts/reiniciar_servidor.sh
```
Reinicia o servidor (útil após alterações no código).

### Verificar Sistema
```bash
./shell_scripts/verificar_sistema.sh
```
Verifica:
- Node.js instalado
- npm instalado
- Dependências instaladas
- Ficheiros essenciais
- Configuração do `.env`

---

## 🔧 Configuração Avançada

### Ambiente Python (Opcional)

Para funcionalidades adicionais de processamento:
```bash
./shell_scripts/setup_python_env.sh
```

Instala:
- requests
- pandas
- numpy
- matplotlib
- scikit-learn
- flask
- beautifulsoup4
- pytest

### Atualizar Dependências

```bash
./shell_scripts/update_dependencies.sh
```

---

## 📊 Estrutura de Dados

O chatbot usa dados organizados em:

### Biografias (`dados/biografias/`)
- Biografias formatadas de figuras importantes
- Formato: Markdown e JSON

### Classificações (`dados/classificacoes/`)
- Histórico de classificações
- Melhores posições em diferentes épocas

### Jogadores (`dados/jogadores/`)
- Informações sobre jogadores
- Equipas históricas

### Resultados (`dados/resultados/`)
- Resultados de jogos importantes
- Estatísticas históricas

### Outros (`dados/outros/`)
- Presidentes do clube
- Dados do livro "50 anos"

---

## 🐛 Resolução de Problemas

### Servidor não inicia
1. Verificar se a porta 3000 está livre:
   ```bash
   lsof -i :3000
   ```
2. Matar processo se necessário:
   ```bash
   kill -9 <PID>
   ```
3. Reiniciar: `./shell_scripts/start_chatbot.sh`

### Erro de API Key
1. Verificar ficheiro `config/.env`
2. Confirmar que a chave é válida
3. Verificar créditos na conta OpenAI

### Dependências em falta
```bash
npm install
```

### Respostas estranhas
1. Verificar logs em `logs/`
2. Reiniciar servidor
3. Verificar integridade do sistema

---

## 💡 Desenvolvimento

### Adicionar Novos Dados

1. **Adicionar biografia**
   - Criar ficheiro `.md` em `dados/biografias/`
   - Seguir formato existente

2. **Adicionar jogadores**
   - Editar `dados/jogadores/jogadores_para_agente.md`

3. **Adicionar resultados**
   - Editar `dados/resultados/resultados_para_agente.md`

### Modificar Agentes

Os agentes estão em `src/agents/`:
- Cada agente processa um tipo de pergunta
- Usam ficheiros de dados específicos
- Integram com OpenAI API

### Adicionar Novo Agente

1. Criar ficheiro em `src/agents/novoAgent.js`
2. Seguir estrutura dos agentes existentes
3. Registar no `src/server.js`
4. Adicionar dados correspondentes em `dados/`

---

## 🎯 Boas Práticas

### Para Utilizadores
- Faça perguntas claras e específicas
- Explore diferentes tópicos
- Use linguagem natural
- Aproveite o contexto da conversa

### Para Desenvolvedores
- Manter dados organizados nas pastas corretas
- Documentar alterações
- Testar agentes após modificações
- Fazer backup de dados importantes
- Seguir estrutura de código existente

---

## 📞 Suporte

Para questões ou problemas:
1. Verificar este guia
2. Executar `./shell_scripts/verificar_sistema.sh`
3. Consultar logs em `logs/`
4. Verificar documentação em `docs/`

---

## 🎉 Exemplos de Conversas

### Exemplo 1: História do Clube
```
Utilizador: Quando foi fundado o Farense?
Chatbot: O Sporting Clube Farense foi fundado a 1 de Setembro de 1910...

Utilizador: E quem foram os fundadores?
Chatbot: [resposta contextualizada]
```

### Exemplo 2: Jogadores
```
Utilizador: Quem foi Paco Fortes?
Chatbot: [biografia detalhada]

Utilizador: Que outros jogadores importantes passaram pelo clube?
Chatbot: [lista de jogadores com contexto]
```

### Exemplo 3: Classificações
```
Utilizador: Qual foi a melhor classificação do Farense?
Chatbot: [informação sobre melhores posições]

Utilizador: Em que ano foi isso?
Chatbot: [detalhes sobre o ano e contexto]
```

---

**Versão:** 1.0
**Data:** Outubro 2025
**Projeto:** Chatbot Farense
