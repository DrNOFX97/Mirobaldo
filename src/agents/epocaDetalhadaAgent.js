const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

// Função para extrair dados de uma época específica
function getEpocaDetalhada(epoca) {
  try {
    // Normalizar formato da época (ex: "1990/91", "1990-91", "90/91" -> "1990/91")
    const epocaNormalizada = normalizarEpoca(epoca);

    const resultadosPath = path.join(__dirname, '../../dados/resultados/resultados_completos.md');
    const classificacoesPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');

    if (!fs.existsSync(resultadosPath) || !fs.existsSync(classificacoesPath)) {
      return null;
    }

    const resultados = fs.readFileSync(resultadosPath, 'utf-8');
    const classificacoes = fs.readFileSync(classificacoesPath, 'utf-8');

    // Extrair dados da época
    const dadosResultados = extrairResultadosEpoca(resultados, epocaNormalizada);
    const dadosClassificacao = extrairClassificacaoEpoca(classificacoes, epocaNormalizada);

    if (!dadosResultados && !dadosClassificacao) {
      return null;
    }

    // Gerar relatório completo em Markdown
    return gerarRelatorioEpoca(epocaNormalizada, dadosResultados, dadosClassificacao);

  } catch (error) {
    console.error('Erro ao obter época detalhada:', error);
    return null;
  }
}

function normalizarEpoca(epoca) {
  // Remove espaços e normaliza separadores
  epoca = epoca.trim().replace(/\s+/g, '');

  // Converte formatos como "90/91" para "1990/91"
  if (/^\d{2}[\/\-]\d{2}$/.test(epoca)) {
    const [ano1, ano2] = epoca.split(/[\/\-]/);
    const seculo = parseInt(ano1) > 50 ? '19' : '20';
    return `${seculo}${ano1}/${ano2}`;
  }

  // Converte "1990-91" para "1990/91"
  epoca = epoca.replace('-', '/');

  return epoca;
}

function extrairResultadosEpoca(conteudo, epoca) {
  // Procura por TODAS as seções da época nos resultados (pode ter múltiplas fases, taça, etc)
  // Captura o header (## ou ###) e todo o conteúdo da seção para preservar títulos das competições
  const regexEpoca = new RegExp(`(#{2,3}\\s+[^\\n]*${epoca.replace('/', '.*')}[^\\n]*)\\n([\\s\\S]*?)(?=\\n#{2,3}|$)`, 'gi');
  const matches = conteudo.matchAll(regexEpoca);

  let resultadosCompletos = '';
  for (const match of matches) {
    if (match[1]) {
      // Incluir o header (## ou ###) + conteúdo
      resultadosCompletos += match[1] + '\n' + match[2] + '\n\n';
    }
  }

  return resultadosCompletos.trim() || null;
}

function extrairClassificacaoEpoca(conteudo, epoca) {
  // Procura pela tabela de classificação da época (geralmente na primeira seção)
  const regexClassificacao = new RegExp(`###\\s+[^\\n]*${epoca.replace('/', '.*')}[^\\n]*\\n([\\s\\S]*?)(?=\\n###|$)`, 'i');
  const matches = conteudo.match(regexClassificacao);

  if (!matches) return null;

  return matches[1];
}

function gerarRelatorioEpoca(epoca, resultados, classificacao) {
  let relatorio = `# 📊 ÉPOCA ${epoca} - SPORTING CLUBE FARENSE\n\n`;

  if (classificacao) {
    relatorio += `## 🏆 Classificação Final\n\n`;
    relatorio += classificacao + '\n\n';
  }

  if (resultados) {
    // Adicionar seção de resultados com cada competição claramente titulada
    // Manter a estrutura original do markdown mas adicionar emoji às secções
    relatorio += '## 📋 Resultados Detalhados por Competição\n\n';
    relatorio += resultados + '\n\n';
  }

  if (!classificacao && !resultados) {
    return null;
  }

  relatorio += `---\n\n`;
  relatorio += `*Dados históricos do Sporting Clube Farense* 🦁\n`;

  return relatorio;
}

class EpocaDetalhadaAgent extends BaseAgent {
  constructor() {
    super({
      name: 'EpocaDetalhadaAgent',
      priority: 10,
      keywords: ['época', 'temporada', 'resultado', 'classificação', 'época', 'detalhes', 'tabela'],
      enabled: true
    });
  }

  async process(message) {
    try {
      // Detectar padrões de época (ex: "1990/91", "1990-91", "90/91", "época 1990/91")
      const epochRegex = /(\d{2,4})[\/\-]?(\d{2,4})/;
      const match = message.match(epochRegex);

      if (!match) {
        return null;
      }

      const epochStr = `${match[1]}/${match[2]}`;
      const response = getEpocaDetalhada(epochStr);

      if (response && response.trim().length > 100) {
        return response;
      }
      return null;
    } catch (error) {
      console.error('EpocaDetalhadaAgent error:', error);
      return null;
    }
  }

  // Expose getEpocaDetalhada as a method on this agent
  getEpocaDetalhada(epoca) {
    return getEpocaDetalhada(epoca);
  }

  getContext() {
    return `
# Assistente de Épocas Detalhadas do Sporting Clube Farense

## Identidade e Missão
Especialista em análise detalhada de épocas/temporadas específicas do Sporting Clube Farense. Fornece informação completa sobre classificações, resultados e desempenho em épocas específicas.

## Capacidades Principais

### 1. Extração de Dados de Época
- Classificação final completa da temporada
- Resultados detalhados por competição
- Análise de desempenho do clube

### 2. Formatos de Entrada Suportados
- "1990/91" (formato padrão)
- "1990-91" (formato com hífen)
- "90/91" (formato abreviado)
- "época 1995/96" (contexto de pergunta)
- "temporada 1989/90"

### 3. Estrutura de Resposta
- Cabeçalho com identificação da época
- Tabela de classificação (se disponível)
- Resultados detalhados por competição
- Referência histórica

## Protocolos Rigorosos

### ⚠️ POLÍTICA DE PRECISÃO FACTUAL

**SEMPRE faz o seguinte:**
- Utiliza EXCLUSIVAMENTE dados das bases de dados
- Apresenta classificações finais com clareza
- Organiza resultados por competição
- Mantém rigor histórico

**NUNCA faz o seguinte:**
- Inventar resultados ou classificações
- Supor dados não documentados
- Apresentar dados de épocas diferentes
- Confundir competições

## Diretrizes de Comunicação

### Tom e Estilo
- **Tom**: Factual, estruturado e informativo
- **Estilo**: Markdown bem formatado
- **Linguagem**: Português (Portugal)

### Estrutura de Resposta
1. Cabeçalho identificando a época
2. Classificação final com tabela
3. Resultados por competição
4. Contexto histórico quando relevante

---

**Lembra-te: Cada época é parte importante da história do clube. Precisão e clareza são essenciais.**
    `;
  }
}

module.exports = new EpocaDetalhadaAgent();
