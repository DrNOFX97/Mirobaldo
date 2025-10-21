# 🦁 Mirobaldo - Chatbot do Sporting Clube Farense

<div align="center">

![Mirobaldo Logo](public/mirobaldo_chatbot.png)

**Um assistente virtual inteligente dedicado à história e memória do Sporting Clube Farense**

[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-blue.svg)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Sobre o Projeto

Mirobaldo é um chatbot conversacional que preserva e partilha a rica história do Sporting Clube Farense. Utilizando inteligência artificial avançada e uma extensa base de dados histórica, o Mirobaldo oferece respostas detalhadas e precisas sobre:

- 📊 **206 biografias** de jogadores, treinadores e figuras históricas
- 🏆 **Classificações completas** desde a fundação do clube
- ⚽ **Resultados de jogos** jornada a jornada
- 📅 **Relatórios detalhados de épocas** completas
- 📚 Livros, presidentes e fundação do clube

---

## ✨ Funcionalidades Principais

### 🤖 Sistema de Agentes Especializados

O Mirobaldo utiliza **8 agentes especializados** que trabalham de forma inteligente para fornecer informações precisas:

1. **biografiasAgent** - 206 biografias completas com busca fuzzy e normalização de acentos
2. **epocaDetalhadaAgent** - Relatórios completos de qualquer época (classificação + todos os jogos)
3. **classificacoesAgent** - Histórico de classificações desde a fundação
4. **resultadosAgent** - Resultados detalhados jogo a jogo
5. **jogadoresAgent** - Informações sobre jogadores e plantéis
6. **livrosAgent** - Biblioteca sobre o clube
7. **presidentesAgent** - História dos dirigentes
8. **fundacaoAgent** - História da fundação e primeiros anos

### 🎯 Características Técnicas

- ✅ **Respostas instantâneas** - Biografias e épocas retornam Markdown completo sem processamento GPT
- ✅ **Busca inteligente** - Normalização de acentos e matching fuzzy
- ✅ **Formatação rica** - Todas as respostas em Markdown com emojis e tabelas
- ✅ **Zero invenções** - Sistema rigoroso que só retorna dados verificados
- ✅ **Múltiplos formatos** - Aceita "1990/91", "90/91", "1990-91", etc.

---

## 🛠️ Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | v14+ | Runtime JavaScript para servidor |
| **Express.js** | 4.21.2 | Framework web minimalista e robusto |
| **OpenAI API** | 4.77.3 | Integração com GPT-4o-mini para processamento de linguagem natural |
| **dotenv** | 16.4.7 | Gestão segura de variáveis de ambiente |
| **cors** | 2.8.5 | Middleware para Cross-Origin Resource Sharing |
| **body-parser** | 1.20.3 | Parser de requisições HTTP |

### Frontend

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura semântica moderna |
| **CSS3** | Estilização com variáveis CSS e design responsivo |
| **JavaScript Vanilla** | Interatividade sem dependências |
| **Marked.js** | 15.0.6 - Renderização de Markdown para HTML |
| **Space Grotesk** | Fonte moderna do Google Fonts |
| **JetBrains Mono** | Fonte monoespaçada para código |

### Ferramentas de Desenvolvimento

| Ferramenta | Versão | Uso |
|------------|--------|-----|
| **nodemon** | 3.1.9 | Hot reload durante desenvolvimento |
| **Git** | - | Controlo de versões |
| **npm** | v6+ | Gestor de pacotes |

---

## 📋 Requisitos do Sistema

- **Node.js** v14.0.0 ou superior
- **npm** v6.0.0 ou superior
- **Chave API da OpenAI** ([obter aqui](https://platform.openai.com/api-keys))
- **Sistema Operativo**: macOS, Linux ou Windows
- **Navegador**: Chrome, Firefox, Safari ou Edge (versões recentes)

---

## 🚀 Instalação e Configuração

### Método 1: Instalação Rápida (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/DrNOFX97/Mirobaldo.git
cd Mirobaldo
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure a API Key da OpenAI:**

Crie o ficheiro `config/.env` e adicione a sua chave:
```bash
OPENAI_API_KEY=sk-sua-chave-aqui
PORT=3000
```

4. **Inicie o servidor:**
```bash
npm start
```

5. **Aceda ao chatbot:**
```
http://localhost:3000
```

### Método 2: Usando Scripts de Gestão

O projeto inclui scripts de gestão no diretório `shell_scripts/`:

```bash
# Menu interativo com todas as opções
./shell_scripts/iniciar.sh

# Ou comandos diretos:
./shell_scripts/start_chatbot.sh      # Iniciar servidor
./shell_scripts/parar_servidor.sh     # Parar servidor
./shell_scripts/reiniciar_servidor.sh # Reiniciar servidor
./shell_scripts/status_servidor.sh    # Ver status
./shell_scripts/abrir_navegador.sh    # Abrir no navegador
```

---

## 📁 Estrutura do Projeto

```
Mirobaldo/
├── 📂 src/                          # Código fonte do servidor
│   ├── server.js                   # Servidor Express principal
│   └── 📂 agents/                  # Agentes especializados (8)
│       ├── biografiasAgent.js      # 206 biografias com busca inteligente
│       ├── epocaDetalhadaAgent.js  # Relatórios completos de épocas
│       ├── classificacoesAgent.js  # Histórico de classificações
│       ├── resultadosAgent.js      # Resultados jogo a jogo
│       ├── jogadoresAgent.js       # Informações de jogadores
│       ├── livrosAgent.js          # Biblioteca do clube
│       ├── presidentesAgent.js     # História dos presidentes
│       └── fundacaoAgent.js        # Fundação e primeiros anos
│
├── 📂 public/                       # Interface web (frontend)
│   ├── index.html                  # Página principal
│   ├── styles.css                  # Estilos CSS com design system
│   ├── script.js                   # Lógica do cliente
│   └── mirobaldo_chatbot.png       # Logo do chatbot
│
├── 📂 dados/                        # Base de conhecimento histórico
│   ├── 📂 biografias/              # 206 ficheiros de biografias
│   │   ├── historia_hassan_nader.md
│   │   ├── historia_paco_fortes.md
│   │   └── ... (204 mais)
│   ├── 📂 classificacoes/          # Tabelas classificativas
│   │   └── classificacoes_completas.md
│   ├── 📂 resultados/              # Resultados históricos
│   │   └── resultados_completos.md
│   ├── 📂 jogadores/               # Listas de jogadores
│   └── 📂 outros/                  # Dados adicionais
│
├── 📂 config/                       # Configurações
│   └── .env                        # Variáveis de ambiente (não versionado)
│
├── 📂 shell_scripts/                # Scripts de gestão do sistema
├── 📂 docs/                         # Documentação completa
├── 📂 node_modules/                 # Dependências (não versionado)
├── .gitignore                       # Ficheiros ignorados pelo Git
├── package.json                     # Configuração do projeto Node.js
├── package-lock.json                # Lock de versões de dependências
└── README.md                        # Este ficheiro
```

---

## 💬 Exemplos de Uso

### Biografias
```
👤 "Quem foi Hassan Nader?"
👤 "Biografia de Paco Fortes"
👤 "Fala-me sobre João Gralho"
👤 "António Gago"
```
**Resultado:** Retorna biografia completa em Markdown (80-144 linhas) com toda a carreira no Farense.

### Épocas Detalhadas
```
📅 "época 1994/95"
📅 "resultados da época 1990/91"
📅 "90/91"
📅 "temporada 1989/90"
```
**Resultado:** Relatório completo com classificação final + todos os 34-38 jogos da época.

### Classificações
```
🏆 "Qual foi a melhor classificação do Farense?"
🏆 "classificação 1994/95"
🏆 "tabela classificativa"
```

### Resultados
```
⚽ "resultado farense vs benfica 1995"
⚽ "jogos da taça de portugal 1990"
⚽ "golos marcados em 94/95"
```

### História do Clube
```
📖 "Quando foi fundado o Farense?"
📖 "História da fundação"
📖 "Presidentes do clube"
📖 "Livros sobre o Farense"
```

---

## 🎨 Design e Interface

### Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| 🔴 Farense Red | `#c41e3a` | Cor principal do clube |
| ⚫ Farense Black | `#0a0a0a` | Cor secundária |
| ⚪ White | `#ffffff` | Texto principal |
| 🌑 Background | `#0f0f0f` | Fundo da aplicação |
| 💬 User Message | `#1a1a1a` | Fundo das mensagens do utilizador |
| 🤖 Bot Message | `#0d0d0d` | Fundo das respostas do bot |

### Tipografia

- **Títulos e corpo**: Space Grotesk (Google Fonts)
- **Código e monospace**: JetBrains Mono (Google Fonts)

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente (.env)

```bash
# Chave API da OpenAI (obrigatório)
OPENAI_API_KEY=sk-sua-chave-aqui

# Porta do servidor (opcional, padrão: 3000)
PORT=3000

# Nível de log (opcional)
LOG_LEVEL=info
```

### Personalização de Agentes

Cada agente em `src/agents/` pode ser personalizado:

```javascript
// Exemplo: Aumentar limite de resultados em biografiasAgent.js
if (results.length >= 10) break; // Altere de 5 para 10
```

---

## 🧪 Testes e Validação

### Scripts de Teste Incluídos

```bash
# Testar todas as variações de biografias (9 formatos)
bash /tmp/test_all_bio_formats.sh

# Testar todas as variações de épocas (10 formatos)
bash /tmp/test_epoca_queries.sh
```

### Resultados Esperados

✅ **Biografias**: 100% de sucesso (9/9 testes)
- Retornam 80-144 linhas de Markdown completo
- Todas começam com `#` (título)

✅ **Épocas**: 100% de sucesso (10/10 testes)
- Retornam 74-81 linhas de Markdown completo
- Incluem classificação + resultados completos

---

## 📊 Estatísticas do Projeto

- **📝 206 biografias** completas e verificadas
- **🏆 70+ épocas** com dados completos
- **⚽ 2500+ resultados** de jogos
- **📂 2553 ficheiros** no repositório
- **💾 278.008 linhas** de código e dados
- **🎯 8 agentes** especializados
- **🚀 Resposta instantânea** para biografias e épocas (sem API call)

---

## 🤝 Contribuir para o Projeto

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para a sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** as suas alterações (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- ✅ Mantenha o foco em **dados históricos verificados**
- ✅ Siga o **estilo de código** existente
- ✅ Adicione **testes** para novas funcionalidades
- ✅ Atualize a **documentação** conforme necessário
- ❌ **Não invente** informações sobre o clube

---

## 🐛 Resolução de Problemas

### Problema: "Cannot find module"
**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Port 3000 already in use"
**Solução:**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Ou altere a porta no .env
PORT=3001
```

### Problema: "OpenAI API error"
**Solução:**
- Verifique se a chave API está correta no `config/.env`
- Confirme que tem créditos na sua conta OpenAI
- Teste a chave em: https://platform.openai.com/account/api-keys

---

## 📚 Documentação Adicional

Para mais informações detalhadas, consulte:

- [`docs/ESTRUTURA_PROJETO.md`](docs/ESTRUTURA_PROJETO.md) - Estrutura completa do projeto
- [`docs/GUIA_USO.md`](docs/GUIA_USO.md) - Guia completo de utilização
- [`docs/RELATORIO_ORGANIZACAO.md`](docs/RELATORIO_ORGANIZACAO.md) - Organização do sistema
- [`INICIO_RAPIDO.md`](INICIO_RAPIDO.md) - Guia de início rápido

---

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o ficheiro [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores e Reconhecimentos

**Desenvolvido com:** 🤖 [Claude Code](https://claude.com/claude-code)

**Dados históricos compilados de:**
- Arquivo histórico do Sporting Clube Farense
- [Blog Algarve e Alentejo](http://algarvalentejo.blogspot.com)
- Documentação oficial do clube
- Contribuições de adeptos farenses

---

## 📞 Suporte e Contacto

- **Issues**: [GitHub Issues](https://github.com/DrNOFX97/Mirobaldo/issues)
- **Discussões**: [GitHub Discussions](https://github.com/DrNOFX97/Mirobaldo/discussions)

---

<div align="center">

**Feito com ❤️ pelos Leões de Faro 🦁**

*Preservando a história do Sporting Clube Farense desde 1910*

</div>
