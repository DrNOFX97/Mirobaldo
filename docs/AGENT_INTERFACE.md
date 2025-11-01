# Agent Interface Standard

This document defines the standard interface, patterns, and best practices for all agents in the Mirobaldo chatbot system.

## Table of Contents
1. [Agent Architecture](#agent-architecture)
2. [Interface Specification](#interface-specification)
3. [Agent Types](#agent-types)
4. [Implementation Patterns](#implementation-patterns)
5. [Error Handling](#error-handling)
6. [Testing Guidelines](#testing-guidelines)
7. [Best Practices](#best-practices)
8. [Migration Guide](#migration-guide)

---

## Agent Architecture

### Inheritance Hierarchy

```
BaseAgent (Abstract Base Class)
├── Provider Agents (return null - act as context)
│   ├── LivroConteudoAgent
│   ├── PresidentesAgent
│   ├── JogadoresAgent
│   ├── LivrosAgent
│   ├── FundacaoAgent
│   └── EpocasCompletoAgent
│
└── Processor Agents (return processed data)
    ├── EstatisticasAgent
    ├── BiografiasAgent
    ├── EpocasAgent
    ├── ClassificacoesAgent
    ├── ResultadosAgent
    └── EpocaDetalhadaAgent
```

### Component Interaction

```
User Message
     ↓
AgentRouter.findAgent()
     ↓
Agent.canHandle() [inherited from BaseAgent]
     ↓
Agent.process() [custom implementation]
     ↓
Routing Decision:
├─→ Provider Agent (process() returns null)
│   └─→ GPT uses agent.getContext() + message
│
└─→ Processor Agent (process() returns data)
    └─→ Agent returns processed data directly OR
        └─→ GPT refines with agent.getContext()
```

---

## Interface Specification

### Required Methods (All Agents)

#### 1. Constructor

**Signature:**
```javascript
constructor() {
  super({
    name: string,           // Unique agent identifier
    priority: number,       // 1-10 (higher = checked first)
    keywords: string[],     // Trigger keywords
    enabled: boolean        // Default: true
  });
}
```

**Example:**
```javascript
class EpocasAgent extends BaseAgent {
  constructor() {
    super({
      name: 'EpocasAgent',
      priority: 8,
      keywords: ['época', 'temporada', 'season'],
      enabled: true
    });
  }
}
```

**Rules:**
- ✓ Must call `super()` with configuration object
- ✓ All properties required (no defaults)
- ✓ Name must be unique across all agents
- ✓ Priority: 1 (lowest) to 10 (highest)
- ✓ Keywords should be domain-specific, non-overlapping

---

#### 2. process(message) - **MUST OVERRIDE**

**Signature:**
```javascript
async process(message: string): Promise<string | null>
```

**Returns:**
- `string`: Processed data (Processor Agents)
- `null`: No specific data, use context only (Provider Agents)

**Implementation Requirements:**

**Provider Agents:**
```javascript
async process(message) {
  // Provider agents act purely as context contributors
  // They return null and let GPT decide using getContext()
  return null;
}
```

**Processor Agents:**
```javascript
async process(message) {
  try {
    // Extract relevant information from message
    const query = extractQuery(message);

    // Process data if query matches
    if (matches) {
      const processed = processData(query);
      return processed;
    }

    // No match - return null for fallback
    return null;
  } catch (error) {
    console.error(`[AGENT_NAME] Error:`, error);
    return null;  // Always fail gracefully
  }
}
```

**Error Handling:**
- ✓ Always use try-catch
- ✓ Always return null on error (not throw)
- ✓ Log all errors with context

---

#### 3. canHandle(message) - **INHERITED, DO NOT OVERRIDE**

**Behavior:**
Checks if message contains agent keywords (case-insensitive)

```javascript
// BaseAgent implementation
canHandle(message) {
  if (!this.enabled) return false;
  if (!message || message.trim().length === 0) return false;

  const lowerMessage = message.toLowerCase();
  return this.keywords.some(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  );
}
```

**Do NOT override** unless you have very specific pattern matching needs.

---

#### 4. getContext() - **MUST OVERRIDE**

**Signature:**
```javascript
getContext(): string
```

**Purpose:**
Provide agent-specific instructions to GPT to improve response quality.

**Structure Template:**
```javascript
getContext() {
  return `
# Agent Name - Sporting Clube Farense

## Identidade
[What role this agent plays]

## Missão
[What this agent should accomplish]

## Dados Disponíveis
- [Data type 1]
- [Data type 2]
- [Time period coverage]

## Protocolos Rigorosos
- NUNCA [Critical prohibition]
- SEMPRE [Critical requirement]

## Diretrizes
[Specific instructions for behavior]

## Exemplos de Consultas
- [Example 1]
- [Example 2]
  `;
}
```

**Real Example:**
```javascript
getContext() {
  return `
# Assistente de Classificações - Sporting Clube Farense

## Identidade
Especialista em histórico de classificações do Sporting Clube Farense.

## Missão
Fornecer classificações finais precisas e contextualizadas.

## Dados Disponíveis
- Classificações finais de todas as épocas
- Posições finais em diferentes competições

## Protocolos Rigorosos
- NUNCA inventes classificações ou épocas
- SEMPRE cita dados fornecidos explicitamente
- Se época não disponível, diz "Não tenho dados"

## Diretrizes
- Refere competição clara (ex: "Série Algarve", "II Divisão")
- Indica posição final com número ordinal
- Menciona pontos se disponível

## Exemplos de Consultas
- "Qual foi a posição de 1990/91?"
- "Classificação de 2000/01"
- "Donde terminou em 1995?"
  `;
}
```

**Context Quality Guidelines:**
- Minimum: ~500 characters
- Recommended: ~1-3 KB
- Maximum: ~10 KB (diminishing returns)

**Context should include:**
1. Agent identity and role
2. Mission/purpose
3. Data coverage (what's available)
4. Critical protocols (do's and don'ts)
5. Communication guidelines
6. Example queries

---

#### 5. getMetadata() - **INHERITED, DO NOT OVERRIDE**

**Behavior:**
Returns agent configuration as object

```javascript
// BaseAgent implementation (don't override)
getMetadata() {
  return {
    name: this.name,
    priority: this.priority,
    enabled: this.enabled,
    keywords: this.keywords,
    contextLength: this.getContext().length
  };
}
```

**Usage:**
```javascript
const metadata = agent.getMetadata();
console.log(metadata);
// Output: {
//   name: 'EpocasAgent',
//   priority: 8,
//   enabled: true,
//   keywords: ['época', 'temporada', ...],
//   contextLength: 2847
// }
```

---

### Optional Methods

#### 6. validate() - **INHERITED, DO NOT OVERRIDE**

Returns validation status of agent configuration.

```javascript
// BaseAgent implementation
validate() {
  const errors = [];
  if (!this.name) errors.push('Missing name');
  if (typeof this.priority !== 'number') errors.push('Invalid priority');
  if (!Array.isArray(this.keywords)) errors.push('Keywords must be array');

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

#### 7. Custom Helper Methods - **OPTIONAL**

Agents may expose custom methods for internal use:

```javascript
class BiografiasAgent extends BaseAgent {
  // Custom public method (non-standard but useful)
  searchBiografias(query) {
    return searchBiografias(query);
  }
}
```

**Guidelines:**
- ✓ Keep custom methods private when possible
- ✓ Document custom methods clearly
- ✓ Don't override standard interface methods
- ✓ Maintain consistency with other agents

---

## Agent Types

### Type 1: Provider Agents (Return null)

**Characteristics:**
- Act as context providers for GPT
- process() always returns null
- Provide rich getContext()
- GPT makes final decisions

**Agents:**
- `LivroConteudoAgent` - Book content context
- `PresidentesAgent` - President information
- `JogadoresAgent` - Player information
- `LivrosAgent` - Bibliography context
- `FundacaoAgent` - Foundation history
- `EpocasCompletoAgent` - Complete season data

**Pattern:**
```javascript
async process(message) {
  // Always return null - GPT decides
  return null;
}

getContext() {
  // Rich context for GPT to use
  return `...detailed instructions...`;
}
```

**When to use:**
- Information too complex for agent to process
- Context that helps GPT make better decisions
- General knowledge that aids reasoning

---

### Type 2: Processor Agents (Return data)

**Characteristics:**
- Extract and process specific data
- process() returns string (data) or null
- Data is forwarded directly to user
- May still use getContext() for refinement

**Agents:**
- `EstatisticasAgent` - Generate statistics
- `BiografiasAgent` - Search biographies
- `EpocasAgent` - Extract season data
- `ClassificacoesAgent` - Extract classifications
- `ResultadosAgent` - Extract match results
- `EpocaDetalhadaAgent` - Generate detailed reports

**Pattern:**
```javascript
async process(message) {
  try {
    const data = extractData(message);
    if (data) {
      return formatData(data);  // Return processed data
    }
    return null;  // No match, use fallback
  } catch (error) {
    console.error(error);
    return null;  // Error, use fallback
  }
}

getContext() {
  // Provides guidance for GPT if agent returns data
  return `...processing instructions...`;
}
```

**When to use:**
- Structured data extraction
- Complex processing logic
- Data that users expect directly
- Consistency with past responses

---

## Implementation Patterns

### Pattern 1: Basic Data Lookup

```javascript
class SimpleAgent extends BaseAgent {
  constructor() {
    super({
      name: 'SimpleAgent',
      priority: 5,
      keywords: ['keyword1', 'keyword2'],
      enabled: true
    });
  }

  async process(message) {
    try {
      const data = loadData();
      const result = searchData(data, message);
      return result ? formatResult(result) : null;
    } catch (error) {
      console.error('[SimpleAgent]', error);
      return null;
    }
  }

  getContext() {
    return `# Simple Agent Description...`;
  }
}

module.exports = new SimpleAgent();
```

---

### Pattern 2: Complex Processing with Error Handling

```javascript
class ComplexAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ComplexAgent',
      priority: 7,
      keywords: ['trigger1', 'trigger2'],
      enabled: true
    });
    this.cache = new Map();
  }

  async process(message) {
    try {
      // 1. Extract parameters
      const params = this.extractParams(message);
      if (!params) return null;

      // 2. Check cache
      const cacheKey = JSON.stringify(params);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // 3. Process
      const result = await this.processData(params);
      if (!result) return null;

      // 4. Format response
      const formatted = this.formatResult(result);

      // 5. Cache result
      this.cache.set(cacheKey, formatted);

      return formatted;
    } catch (error) {
      console.error(`[ComplexAgent] Error:`, error.message);
      return null;
    }
  }

  extractParams(message) {
    const match = message.match(/pattern/i);
    return match ? match[1] : null;
  }

  async processData(params) {
    // Complex logic
    return data;
  }

  formatResult(data) {
    return `Formatted: ${data}`;
  }

  getContext() {
    return `# Complex Agent...`;
  }
}

module.exports = new ComplexAgent();
```

---

### Pattern 3: File-Based Data with Fallbacks

```javascript
class FileAgent extends BaseAgent {
  constructor() {
    super({
      name: 'FileAgent',
      priority: 6,
      keywords: ['file-related'],
      enabled: true
    });
  }

  async process(message) {
    try {
      // Try primary source
      let data = this.loadPrimarySource();

      // Fallback to secondary source
      if (!data) {
        data = this.loadFallbackSource();
      }

      if (!data) return null;

      // Process
      return this.extractRelevant(data, message);
    } catch (error) {
      console.error(`[FileAgent]`, error.message);
      return null;
    }
  }

  loadPrimarySource() {
    try {
      const path = `netlify/data/file.md`;
      return fs.readFileSync(path, 'utf-8');
    } catch (e) {
      return null;
    }
  }

  loadFallbackSource() {
    try {
      const path = `dados/file.md`;
      return fs.readFileSync(path, 'utf-8');
    } catch (e) {
      return null;
    }
  }

  extractRelevant(data, message) {
    // Extract matching content
    return content;
  }

  getContext() {
    return `# File Agent...`;
  }
}

module.exports = new FileAgent();
```

---

## Error Handling

### Standard Error Handling Pattern

```javascript
async process(message) {
  try {
    // Your logic here
    return result;
  } catch (error) {
    // Log with context
    console.error(`[AgentName] Error in process():`, error.message);

    // Additional logging for debugging
    if (process.env.DEBUG) {
      console.error(`[AgentName] Full stack:`, error);
    }

    // Always return null on error
    return null;
  }
}
```

### Error Levels

| Level | Action | Example |
|-------|--------|---------|
| INFO | Log message processing | `console.log('[Agent] Processing query: ...')` |
| WARN | Resource not found | `console.warn('[Agent] File not found: ...')` |
| ERROR | Exception occurred | `console.error('[Agent] Error: ...', error)` |

### Graceful Degradation

```
No Match → return null → GPT fallback
   ↓
Data Error → return null → GPT fallback
   ↓
Processing Error → return null → GPT fallback
```

**Never throw exceptions** - always return null and let GPT handle fallback.

---

## Testing Guidelines

### Unit Test Structure

```javascript
describe('MyAgent', () => {
  let agent;

  beforeEach(() => {
    agent = require('../../agents/myAgent.js');
  });

  describe('Configuration', () => {
    it('should have correct name', () => {
      expect(agent.name).toBe('MyAgent');
    });

    it('should have priority in valid range', () => {
      expect(agent.priority).toBeGreaterThanOrEqual(1);
      expect(agent.priority).toBeLessThanOrEqual(10);
    });

    it('should have keywords array', () => {
      expect(Array.isArray(agent.keywords)).toBe(true);
      expect(agent.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('canHandle', () => {
    it('should detect trigger keywords', () => {
      expect(agent.canHandle('message with keyword')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(agent.canHandle('MESSAGE WITH KEYWORD')).toBe(true);
    });

    it('should return false for no keywords', () => {
      expect(agent.canHandle('xyz abc def')).toBe(false);
    });
  });

  describe('process', () => {
    it('should return null for non-matching message', async () => {
      const result = await agent.process('unrelated message');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return string or null', async () => {
      const result = await agent.process('query');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Should not throw
      expect(async () => {
        await agent.process('test');
      }).not.toThrow();
    });
  });

  describe('getContext', () => {
    it('should return non-empty string', () => {
      const context = agent.getContext();
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(100);
    });
  });
});
```

---

## Best Practices

### 1. Naming Conventions

```javascript
// ✓ Good
class EpocasAgent extends BaseAgent {}
class ResultadosAgent extends BaseAgent {}
class ClassificacoesAgent extends BaseAgent {}

// ✗ Avoid
class Epocas extends BaseAgent {}  // Missing "Agent"
class myAgent extends BaseAgent {}  // Wrong case
class EpocaResultados extends BaseAgent {}  // Ambiguous
```

### 2. Keyword Selection

```javascript
// ✓ Good - specific, domain-relevant
keywords: ['época', 'temporada', 'season', 'campeonato']

// ✗ Avoid - too generic
keywords: ['data', 'information', 'about']

// ✗ Avoid - overlapping with other agents
keywords: ['result', 'resultado']  // Too broad
```

### 3. Priority Assignment

```javascript
// ✓ Good - based on specificity
EpocaDetalhadaAgent: 10  // Most specific (1939/40 pattern)
EpocasAgent: 8           // Specific (epoch data)
ResultadosAgent: 8       // Specific (results)
LivroConteudoAgent: 5    // General (context provider)

// ✗ Avoid - all the same
Agent1: 5, Agent2: 5, Agent3: 5  // No differentiation
```

### 4. Context Writing

```javascript
// ✓ Good - structured, comprehensive
getContext() {
  return `
# Agent Title

## Identidade
Clear description of role

## Missão
What agent does

## Dados Disponíveis
What data exists

## Protocolos
Critical rules

## Exemplos
Usage examples
  `;
}

// ✗ Avoid - vague, minimal
getContext() {
  return `Agent for epochs and data`;
}
```

### 5. Logging Standards

```javascript
// ✓ Good - contextual, traceable
console.log(`[EpocasAgent] Processing season query: ${season}`);
console.warn(`[EpocasAgent] Data file not found: ${path}`);
console.error(`[EpocasAgent] Error parsing year:`, error.message);

// ✗ Avoid - unclear
console.log('Error');
console.log(error);
```

### 6. Data Validation

```javascript
// ✓ Good - explicit validation
async process(message) {
  try {
    if (!message || message.trim().length === 0) return null;

    const year = extractYear(message);
    if (!year || year < 1913 || year > new Date().getFullYear()) {
      return null;
    }

    const data = loadData(year);
    return data ? formatData(data) : null;
  } catch (error) {
    console.error('[Agent]', error);
    return null;
  }
}

// ✗ Avoid - unsafe assumptions
async process(message) {
  const year = message.match(/\d{4}/)[1];  // Could crash!
  return loadData(year);
}
```

---

## Migration Guide

### Creating a New Agent

#### Step 1: Define Agent Class

```javascript
const BaseAgent = require('../core/BaseAgent');

class MyNewAgent extends BaseAgent {
  constructor() {
    super({
      name: 'MyNewAgent',
      priority: 6,
      keywords: ['keyword1', 'keyword2'],
      enabled: true
    });
  }

  async process(message) {
    // Implementation
    return null;
  }

  getContext() {
    return `# My New Agent\n\nDescription...`;
  }
}

module.exports = new MyNewAgent();
```

#### Step 2: Register in AgentsFactory

```javascript
// src/core/AgentsFactory.js
const router = new AgentRouter();

// Add your agent
router.register(require('../agents/myNewAgent'), 6);

// ...other agents
```

#### Step 3: Create Unit Tests

```javascript
// src/__tests__/agents/MyNewAgent.test.js
describe('MyNewAgent', () => {
  // Test structure from guidelines above
});
```

#### Step 4: Document in API.md

```markdown
## MyNewAgent

**Keywords:** keyword1, keyword2
**Priority:** 6
**Type:** Processor/Provider
**Purpose:** Description of what agent does
```

#### Step 5: Test Integration

```bash
npm test -- MyNewAgent.test.js
npm run dev
# Test manually
```

---

## Compliance Checklist

Use this checklist when creating or modifying agents:

- [ ] Extends BaseAgent correctly
- [ ] Constructor defines all required properties
- [ ] process() method implemented
- [ ] process() returns string or null
- [ ] process() has try-catch error handling
- [ ] getContext() returns substantial string (>100 chars)
- [ ] Agent registered in AgentsFactory
- [ ] Unit tests created and passing
- [ ] Keywords are specific and non-overlapping
- [ ] Priority assigned based on specificity
- [ ] Logging includes agent name prefix
- [ ] No console.error calls without logging
- [ ] Graceful error handling (no throwing)
- [ ] Context includes examples
- [ ] Documentation updated in API.md

---

## Current Agents Status

| Agent | Compliance | Notes |
|-------|-----------|-------|
| EstatisticasAgent | ✓ 100% | Processor, comprehensive context |
| LivroConteudoAgent | ✓ 100% | Provider, good structure |
| PresidentesAgent | ✓ 100% | Provider, clear guidelines |
| JogadoresAgent | ✓ 100% | Provider, well-formatted |
| LivrosAgent | ✓ 100% | Provider, excellent context |
| BiografiasAgent | ✓ 100% | Processor, search functionality |
| EpocasAgent | ✓ 100% | Processor, comprehensive |
| ClassificacoesAgent | ✓ 100% | Processor, detailed context |
| EpocasCompletoAgent | ✓ 100% | Provider, enhanced context |
| FundacaoAgent | ✓ 100% | Provider, dynamic loading |
| ResultadosAgent | ✓ 100% | Processor, improved error handling |
| EpocaDetalhadaAgent | ✓ 100% | Processor, detailed reports |

**Overall Compliance: 100%** ✓

All agents meet the interface standard and follow best practices.
