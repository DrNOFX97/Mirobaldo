# Mirobaldo - Arquitetura Modular

## Visão Geral

O Mirobaldo foi refatorado para seguir uma arquitetura modular e extensível baseada no padrão de **Agentes Especializados** e **Roteamento Inteligente**.

### Estrutura de Diretórios

```
src/
├── core/
│   ├── BaseAgent.js          # Classe abstrata base para todos os agents
│   ├── AgentRouter.js        # Roteador inteligente de agents
│   └── AgentsFactory.js      # Factory para criar e configurar router
│
├── agents/                   # 11 agents especializados
│   ├── biografiasAgent.js
│   ├── epocaDetalhadaAgent.js
│   ├── estatisticasAgent.js
│   ├── classificacoesAgent.js
│   ├── resultadosAgent.js
│   ├── livrosAgent.js
│   ├── livroConteudoAgent.js
│   ├── jogadoresAgent.js
│   ├── presidentesAgent.js
│   ├── fundacaoAgent.js
│   └── epocasAgent.js
│
├── utils/                    # Utilitários reutilizáveis
│   └── injectImages.js
│
└── server.js                 # Express server principal

public/
├── index.html
├── script.js
├── styles.css
└── mirobaldo_chatbot.png

netlify/
├── functions/
│   └── api.js               # Netlify serverless function

dados/
├── biografias/              # Conteúdo (206 biografias)
├── fotografias/             # Imagens
├── classificacoes/          # Dados de competições
└── resultados/              # Resultados de jogos
```

---

## Componentes Principais

### 1. BaseAgent (`src/core/BaseAgent.js`)

Classe abstrata que define a interface padrão para todos os agents.

**Responsabilidades:**
- Definir contrato que todos os agents devem cumprir
- Fornecer logging consistente com prefixos e timestamps
- Oferecer métodos de validação e metadados
- Implementar detecção de capacidade (`canHandle()`)

**Métodos Públicos:**
```javascript
constructor(config)              // Inicializar com config
canHandle(message)               // Verifica se pode processar mensagem
async process(message)           // Processa mensagem (abstrato - deve ser implementado)
getContext()                     // Retorna contexto do sistema para GPT
validate()                       // Valida se agent está bem configurado
getMetadata()                    // Retorna info sobre o agent
log(message, type)               // Log com prefixo e timestamp
```

**Exemplo de Uso:**
```javascript
class MinhaAgent extends BaseAgent {
  constructor() {
    super({
      name: 'MeuAgent',
      context: 'Contexto para o GPT...',
      priority: 7,
      keywords: ['palavra1', 'palavra2'],
      enabled: true
    });
  }

  async process(message) {
    // Implementar lógica específica
    return 'Resposta';
  }
}
```

---

### 2. AgentRouter (`src/core/AgentRouter.js`)

Gerencia roteamento inteligente entre agents baseado em prioridades e palavras-chave.

**Responsabilidades:**
- Registar e organizar agents por prioridade
- Encontrar o agent mais apropriado para cada mensagem
- Fornecer fallback para consultas genéricas
- Oferecer controle dinâmico de agents (ativar/desativar)

**Métodos Públicos:**
```javascript
register(agent, priority)        // Registar agent com prioridade
setFallback(fn)                  // Definir função de fallback
findAgent(message)               // Encontrar agent para mensagem
async route(message)             // Processar mensagem com agent apropriado
getAgentsInfo()                  // Info sobre todos os agents
toggleAgent(name, enabled)       // Ativar/desativar agent
setPriority(name, newPriority)   // Mudar prioridade de agent
debug()                          // Mostrar status completo
```

**Fluxo de Roteamento:**
```
User Message
    ↓
Router.findAgent(message)
    ↓
[Iterate through agents by priority]
    ↓
agent.canHandle(message)?
    ├─ YES → agent.process(message)
    └─ NO  → Try next agent
    ↓
No agent matched?
    ↓
fallbackAgent(message)
```

---

### 3. AgentsFactory (`src/core/AgentsFactory.js`)

Factory que centraliza inicialização e configuração de todos os agents.

**Responsabilidades:**
- Criar instância configurada do router
- Registar todos os agents com suas prioridades
- Fornecer ponto único de configuração do sistema

**Exemplo:**
```javascript
const factory = require('./src/core/AgentsFactory');
const router = factory.createRouter();

// Router pronto com todos os agents registrados e ordenados
const response = await router.route(userMessage);
```

---

## Fluxo de Funcionamento

### Arquitetura Local (Express Server)

```
Cliente Frontend
    ↓ POST /api/chat
Express Server (server.js)
    ↓
Valida entrada
    ↓
AgentRouter.route(message)
    ├─ FindAgent(message)
    │  ├─ Agent.canHandle() → Priority matching
    │  └─ Return best match
    │
    ├─ Agent.process(message)
    │  ├─ biografiasAgent: Search & return markdown
    │  ├─ estatisticasAgent: Generate statistics
    │  ├─ resultadosAgent: Fetch season results
    │  └─ Others: Extract context for GPT
    │
    └─ Fallback: Send to GPT-4o-mini
        ├─ Add agent context
        ├─ Add strict prompts
        └─ Return GPT response
    ↓
JSON Response { reply: '...' }
    ↓
Cliente Frontend (stream lines at 1s/line)
```

### Arquitetura Netlify (Serverless)

```
Cliente Frontend
    ↓ POST /.netlify/functions/api/chat
Netlify Function (netlify/functions/api.js)
    ↓
[Same routing as Express, but adapted for Lambda]
    ↓
JSON Response
    ↓
Cliente Frontend (stream)
```

---

## Prioridades dos Agents

Agents registados por ordem de prioridade:

| Prioridade | Agent | Tipo | Razão |
|-----------|-------|------|-------|
| **10** | epocaDetalhadaAgent | Detector de épocas | Padrões numéricos específicos (89/90, 1989/90) |
| **9** | estatisticasAgent | Análises agregadas | Palavras muito específicas (ranking, recordes) |
| **9** | livroConteudoAgent | Referência de livro | "O livro diz", "segundo o livro" |
| **8** | resultadosAgent | Resultados de jogos | Padrões temporais e keywords únicas |
| **8** | classificacoesAgent | Classificações/tabelas | Refere competições específicas |
| **7** | biografiasAgent | Biografias | Fuzzy search com imagens |
| **6** | presidentesAgent | Presidentes | Keywords de liderança |
| **6** | fundacaoAgent | História/Fundação | "1910", "fundação", "origem" |
| **6** | jogadoresAgent | Infos de jogadores | "plantel", "equipa" |
| **6** | epocasAgent | Épocas | Referências temporais genéricas |
| **5** | livrosAgent | Informação bibliográfica | Fallback para tópicos de livros |

---

## Como Adicionar um Novo Agent

### Passo 1: Criar a Classe

```javascript
// src/agents/meuNovoAgent.js
const BaseAgent = require('../core/BaseAgent');

class MeuNovoAgent extends BaseAgent {
  constructor() {
    super({
      name: 'MeuNovoAgent',
      context: 'Contexto especializado para o GPT...',
      priority: 6,
      keywords: ['palavra1', 'palavra2', 'palavra3'],
      enabled: true
    });
  }

  async process(message) {
    // Implementar lógica
    // Retornar string ou null se não processar
    return 'Resposta formatada em markdown';
  }
}

module.exports = new MeuNovoAgent();
```

### Passo 2: Registar na Factory

```javascript
// src/core/AgentsFactory.js
const meuNovoAgent = require('../agents/meuNovoAgent');

function createRouter() {
  const router = new AgentRouter();

  // ... outros agents ...

  router.register(meuNovoAgent, 6); // Adicionar com prioridade apropriada

  return router;
}
```

### Passo 3: Testar

```bash
npm start
# Testar no navegador ou API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "palavra1 test"}'
```

---

## Padrões de Implementação

### Pattern 1: Direct Response (Sem GPT)

Para queries que têm resposta determinística.

```javascript
async process(message) {
  const result = this.searchData(message);
  if (result) {
    return this.formatMarkdown(result); // Retornar direto
  }
  return null; // Deixar para outro agent ou GPT
}
```

**Exemplos:** biografiasAgent, epocaDetalhadaAgent

### Pattern 2: Context Enrichment (Com GPT)

Para queries que precisam de análise mas com dados específicos.

```javascript
async process(message) {
  // Apenas retornar null - deixar getContext() fornecer dados para GPT
  if (this.canHandle(message)) {
    return null; // AgentRouter vai usar getContext()
  }
  return null;
}

getContext() {
  return 'Dados específicos do domínio para o GPT...';
}
```

**Exemplos:** presidentesAgent, fundacaoAgent

### Pattern 3: Hybrid (Detecção + Enrichment)

```javascript
async process(message) {
  const detectado = this.detectPattern(message);

  if (detectado) {
    const dados = this.generateReport(detectado);
    if (dados) return dados;
  }

  return null; // Fallback para GPT com context
}
```

**Exemplo:** estatisticasAgent, resultadosAgent

---

## Performance e Optimizações

### Caching
Agents podem implementar cache para dados frequentes:

```javascript
class MeuAgent extends BaseAgent {
  constructor() {
    super(config);
    this.cache = new Map();
  }

  async process(message) {
    const cacheKey = this.getCacheKey(message);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = this.computeResult(message);
    this.cache.set(cacheKey, result);
    return result;
  }
}
```

### Lazy Loading
Carregar dados apenas quando necessário:

```javascript
async process(message) {
  if (!this.dados) {
    this.dados = await this.loadData(); // Carregar na 1ª vez
  }

  return this.searchIn(this.dados, message);
}
```

---

## Debugging

### Ativar Debug Mode

```javascript
const router = factory.createRouter();
router.debug(); // Mostra status de todos os agents

// Output:
// 📊 AgentRouter Status:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. ✅ [10] epocaDetalhadaAgent
//    Keywords: época, temporada, 89/90, 1989/90
// ...
```

### Rastrear Agent Selecionado

```javascript
const agent = router.findAgent(userMessage);
if (agent) {
  console.log(`Agent selecionado: ${agent.agent.name} (prioridade: ${agent.priority})`);
}
```

---

## Deployment

### Express Server (Desenvolvimento)
```bash
npm start
# Servidor em http://localhost:3000
```

### Netlify Functions (Produção)
```bash
netlify deploy --prod
# Função em https://seu-site.netlify.app/.netlify/functions/api/chat
```

---

## Migração de Código Legado

Se tiver agents no formato antigo (sem herança de BaseAgent):

```javascript
// Antes (legado)
const biografiasAgent = {
  context: '...',
  searchBiografias: () => { ... }
};

// Depois (novo padrão)
class BiografiasAgent extends BaseAgent {
  constructor() {
    super({
      name: 'BiografiasAgent',
      context: '...',
      keywords: ['biografia', 'quem foi', ...],
      priority: 7
    });
  }

  async process(message) {
    const results = this.searchBiografias(message);
    if (results.length > 0) {
      return results[0].content;
    }
    return null;
  }

  searchBiografias(query) {
    // Implementação anterior ...
  }
}

module.exports = new BiografiasAgent();
```

---

## Troubleshooting

### Agent não está sendo selecionado

1. Verificar se keywords são precisos
2. Verificar prioridade vs outros agents
3. Verificar se está ativado: `agent.enabled`
4. Testar com `router.findAgent(message)`

### Agent retorna sempre null

- `process()` está retornando null quando deveria retornar resposta
- Verificar lógica de detecção
- Adicionar logging: `this.log('Debug: ' + message)`

### Performance lenta

- Implementar cache para dados grandes
- Usar lazy loading
- Reduzir tamanho do context para GPT

---

## Próximas Melhorias

- [ ] Implementar CacheManager centralizado
- [ ] Adicionar AgentPerformanceMonitor
- [ ] Suporte a agents assincronizados em paralelo
- [ ] Rate limiting per agent
- [ ] Analytics de seleção de agents
- [ ] A/B testing de prioridades

---

**Versão**: 2.0.0
**Última Atualização**: Outubro 2025
**Padrão**: Modular Agent-Router Architecture
