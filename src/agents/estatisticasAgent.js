const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

// Load classification data
function loadClassificacoes() {
  try {
    const dataPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');
    return fs.readFileSync(dataPath, 'utf-8');
  } catch (error) {
    console.error('Error loading classifications:', error);
    return '';
  }
}

// Load results data
function loadResultados() {
  try {
    const dataPath = path.join(__dirname, '../../dados/resultados/resultados_para_agente.md');
    return fs.readFileSync(dataPath, 'utf-8');
  } catch (error) {
    console.error('Error loading results:', error);
    return '';
  }
}

// Parse seasons from classification data (table format)
function parseSeasons(classifData) {
  const seasons = [];

  // Split content by ### sections
  const sections = classifData.split(/^###\s+/m);

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const firstLineMatch = section.match(/^([^(\n]*?)\s+(\d+)\/(\d+)\s*\n/);

    if (!firstLineMatch) continue;

    const epochName = firstLineMatch[1].trim();
    let year1 = parseInt(firstLineMatch[2]);
    const year2 = parseInt(firstLineMatch[3]);

    // Normalize year: if year1 is 2-digit and > 30, it's 19xx, otherwise 20xx
    if (year1 < 100) {
      year1 = year1 > 30 ? 1900 + year1 : 2000 + year1;
    }

    const epochLabel = `${year1}/${String(year2).padStart(2, '0')}`;

    // Look for Farense row in the table (rows with 🦁 or *Farense*)
    const farenseRowRegex = /\|\s*\*?\*?(\d+)\*?\*?\s*\|\s*\*?\*?Farense\*?\*?\s*🦁\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([0-9-]+)\s*\|/;
    const rowMatch = section.match(farenseRowRegex);

    if (rowMatch) {
      const position = parseInt(rowMatch[1]);
      const points = parseInt(rowMatch[2]);
      const games = parseInt(rowMatch[3]);
      const wins = parseInt(rowMatch[4]);
      const draws = parseInt(rowMatch[5]);
      const losses = parseInt(rowMatch[6]);
      const goalsFor = parseInt(rowMatch[7]);
      const goalsAgainst = rowMatch[8] === '-' ? 0 : parseInt(rowMatch[8]);

      const goalDiff = goalsFor - goalsAgainst;

      seasons.push({
        epoca: epochLabel,
        year: year1,
        position: position,
        points: points,
        games: games,
        wins: wins,
        draws: draws,
        losses: losses,
        goalsFor: goalsFor,
        goalsAgainst: goalsAgainst,
        goalDiff: goalDiff
      });
    }
  }

  return seasons;
}

// Generate records and rankings
function generateRecords(seasons) {
  if (!seasons || seasons.length === 0) return '';

  const validSeasons = seasons.filter(s => s.points !== null);
  if (validSeasons.length === 0) return '';

  const sorted = {
    byPoints: [...validSeasons].sort((a, b) => b.points - a.points),
    byGoalsFor: [...validSeasons].filter(s => s.goalsFor).sort((a, b) => b.goalsFor - a.goalsFor),
    byGoalsAgainst: [...validSeasons].filter(s => s.goalsAgainst).sort((a, b) => a.goalsAgainst - b.goalsAgainst),
    byGoalDiff: [...validSeasons].filter(s => s.goalDiff !== null).sort((a, b) => b.goalDiff - a.goalDiff),
    byWins: [...validSeasons].filter(s => s.wins).sort((a, b) => b.wins - a.wins)
  };

  let report = '## 📊 RECORDES E RANKINGS DO FARENSE\n\n';

  // Best seasons by points
  if (sorted.byPoints.length > 0) {
    report += '### 🏆 Top 5 - Épocas com Mais Pontos\n';
    sorted.byPoints.slice(0, 5).forEach((s, i) => {
      report += `${i + 1}. **${s.epoca}**: ${s.points} pontos\n`;
    });
    report += '\n';
  }

  // Best attacking records
  if (sorted.byGoalsFor.length > 0) {
    report += '### ⚽ Top 3 - Mais Golos Marcados\n';
    sorted.byGoalsFor.slice(0, 3).forEach((s, i) => {
      report += `${i + 1}. **${s.epoca}**: ${s.goalsFor} golos\n`;
    });
    report += '\n';
  }

  // Best defensive records
  if (sorted.byGoalsAgainst.length > 0) {
    report += '### 🛡️ Top 3 - Menos Golos Sofridos\n';
    sorted.byGoalsAgainst.slice(0, 3).forEach((s, i) => {
      report += `${i + 1}. **${s.epoca}**: ${s.goalsAgainst} golos sofridos\n`;
    });
    report += '\n';
  }

  // Best goal difference
  if (sorted.byGoalDiff.length > 0) {
    report += '### 📈 Top 3 - Melhor Diferença de Golos\n';
    sorted.byGoalDiff.slice(0, 3).forEach((s, i) => {
      report += `${i + 1}. **${s.epoca}**: +${s.goalDiff}\n`;
    });
    report += '\n';
  }

  return report;
}

// Generate comparison between two seasons
function compareSeasons(seasons, epoch1, epoch2) {
  const s1 = seasons.find(s => s.epoca === epoch1 || s.epoca.includes(epoch1));
  const s2 = seasons.find(s => s.epoca === epoch2 || s.epoca.includes(epoch2));

  if (!s1 || !s2) {
    return `❌ Não consegui encontrar dados para ambas as épocas (${epoch1} e ${epoch2})`;
  }

  let comparison = `## 📊 COMPARAÇÃO: ${s1.epoca} vs ${s2.epoca}\n\n`;
  comparison += '| Métrica | ' + s1.epoca + ' | ' + s2.epoca + ' | Diferença |\n';
  comparison += '|---------|----------|----------|----------|\n';

  if (s1.points && s2.points) {
    const diff = s1.points - s2.points;
    comparison += `| Pontos | ${s1.points} | ${s2.points} | ${diff > 0 ? '+' : ''}${diff} |\n`;
  }

  if (s1.goalsFor && s2.goalsFor) {
    const diff = s1.goalsFor - s2.goalsFor;
    comparison += `| Golos Marcados | ${s1.goalsFor} | ${s2.goalsFor} | ${diff > 0 ? '+' : ''}${diff} |\n`;
  }

  if (s1.goalsAgainst && s2.goalsAgainst) {
    const diff = s1.goalsAgainst - s2.goalsAgainst;
    comparison += `| Golos Sofridos | ${s1.goalsAgainst} | ${s2.goalsAgainst} | ${diff > 0 ? '+' : ''}${diff} |\n`;
  }

  if (s1.wins && s2.wins) {
    const diff = s1.wins - s2.wins;
    comparison += `| Vitórias | ${s1.wins} | ${s2.wins} | ${diff > 0 ? '+' : ''}${diff} |\n`;
  }

  return comparison + '\n';
}

// Generate trends over decades
function generateTrends(seasons) {
  const byDecade = {};

  seasons.forEach(s => {
    const decade = Math.floor(s.year / 10) * 10;
    if (!byDecade[decade]) {
      byDecade[decade] = [];
    }
    byDecade[decade].push(s);
  });

  let trends = '## 📈 TENDÊNCIAS POR DÉCADA\n\n';

  Object.keys(byDecade).sort().forEach(decade => {
    const decadeSeasons = byDecade[decade];
    const validPoints = decadeSeasons.filter(s => s.points).map(s => s.points);
    const validGoals = decadeSeasons.filter(s => s.goalsFor).map(s => s.goalsFor);

    if (validPoints.length > 0) {
      const avgPoints = (validPoints.reduce((a, b) => a + b, 0) / validPoints.length).toFixed(1);
      const avgGoals = validGoals.length > 0 ?
        (validGoals.reduce((a, b) => a + b, 0) / validGoals.length).toFixed(1) : 'N/A';

      trends += `### Anos ${decade}s\n`;
      trends += `- **Épocas**: ${decadeSeasons.length}\n`;
      trends += `- **Pontos Médios**: ${avgPoints}\n`;
      trends += `- **Golos Médios**: ${avgGoals}\n`;
      trends += `- **Melhor Classificação**: ${decadeSeasons.find(s => s.points === Math.max(...validPoints))?.epoca}\n\n`;
    }
  });

  return trends;
}

// Generate analysis by competition
function generateCompetitionAnalysis(resultsData) {
  let analysis = '## 🏟️ ANÁLISE POR COMPETIÇÃO\n\n';

  // Extract I Divisão data
  const idivMatch = resultsData.match(/I\s+Divisão[^]*?(?=##|$)/i);
  if (idivMatch) {
    analysis += '### Liga I (Primeira Divisão)\n';
    const seasons = (idivMatch[0].match(/Época\s+\d{4}\/\d{2}/gi) || []).length;
    analysis += `- **Total de Épocas**: ${seasons}\n`;
    analysis += '- **Melhor Resultado**: 5º lugar (1994/95)\n';
    analysis += '- **Qualificação Europeia**: 1995/96 (Taça UEFA)\n\n';
  }

  // Extract II Divisão data
  const iidivMatch = resultsData.match(/II\s+Divisão[^]*?(?=##|$)/i);
  if (iidivMatch) {
    analysis += '### Liga II (Segunda Divisão)\n';
    analysis += '- **Título de Campeão**: 1989/90\n';
    analysis += '- **Maior Campanha**: 1989/90 - 55 pontos em 34 jogos\n\n';
  }

  // Extract Cup data
  analysis += '### Taça de Portugal\n';
  analysis += '- **Melhor Resultado**: Final (1989/90)\n';
  analysis += '- **Adversário na Final**: Estrela da Amadora\n';
  analysis += '- **Resultado**: Derrota 2-0 (em jogo de repetição)\n\n';

  return analysis;
}

class EstatisticasAgent extends BaseAgent {
  constructor() {
    super({
      name: 'EstatisticasAgent',
      priority: 9,
      keywords: ['ranking', 'recordes', 'estatísticas', 'melhor', 'pior', 'pontos', 'golos', 'tendência', 'comparação', 'classificação'],
      enabled: true
    });
  }

  async process(message) {
    try {
      const classificacoes = loadClassificacoes();
      const resultados = loadResultados();

      if (!classificacoes || !resultados) {
        return null; // Fall back to GPT
      }

      const response = this.generateStatisticsInternal(message, classificacoes, resultados);

      if (response && response.trim().length > 100) {  // Only return if substantive response
        return response;
      }
      return null;  // Fall back to GPT for other queries
    } catch (error) {
      console.error('EstatisticasAgent error:', error);
      return null;
    }
  }

  generateStatisticsInternal(query, classificacoes, resultados) {
    const seasons = parseSeasons(classificacoes);
    let response = '';

    const lowerQuery = query.toLowerCase();

    // Records
    if (lowerQuery.includes('record') || lowerQuery.includes('melhor') ||
        lowerQuery.includes('ranking') || lowerQuery.includes('top')) {
      response += generateRecords(seasons);
    }

    // Comparisons
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs') ||
        lowerQuery.includes('versus') || lowerQuery.includes('diferença')) {
      // Try to extract epoch years
      const epochRegex = /(\d{4})[\/-]?(\d{2,4})?/g;
      const matches = [...query.matchAll(epochRegex)];
      if (matches.length >= 2) {
        const epoch1 = `${matches[0][1]}/${matches[0][2] || matches[0][1].slice(-2)}`;
        const epoch2 = `${matches[1][1]}/${matches[1][2] || matches[1][1].slice(-2)}`;
        response += compareSeasons(seasons, epoch1, epoch2);
      }
    }

    // Trends
    if (lowerQuery.includes('tendência') || lowerQuery.includes('evolução') ||
        lowerQuery.includes('década') || lowerQuery.includes('história')) {
      response += generateTrends(seasons);
    }

    // Competition analysis
    if (lowerQuery.includes('competição') || lowerQuery.includes('liga') ||
        lowerQuery.includes('taça') || lowerQuery.includes('divisão')) {
      response += generateCompetitionAnalysis(resultados);
    }

    // If no specific request, generate overview
    if (!response) {
      response += generateRecords(seasons);
      response += generateTrends(seasons);
    }

    return response;
  }

  getContext() {
    return `
# Assistente de Estatísticas do Sporting Clube Farense

## Identidade e Missão
és um especialista em estatísticas e análise histórica do Sporting Clube Farense. A tua função é fornecer análises detalhadas sobre desempenho, records, rankings e tendências históricas do clube.

## Capacidades Principais

### 1. Recordes e Rankings
- Top 5 épocas por pontos conquistados
- Melhor e pior temporadas
- Recordes ofensivos (golos marcados)
- Recordes defensivos (golos sofridos)
- Diferença de golos histórica

### 2. Comparações Entre Épocas
- Comparação lado-a-lado de duas temporadas
- Análise de métricas específicas
- Evolução temporal de desempenho

### 3. Tendências e Análise
- Análise por década
- Identificação de períodos de sucesso e dificuldade
- Evolução geral do clube

### 4. Análise por Competição
- Desempenho em Liga I e Liga II
- Resultados em Taça de Portugal
- Participações Europeias

## Protocolos Rigorosos

### ⚠️ POLÍTICA DE PRECISÃO FACTUAL

**SEMPRE faz o seguinte:**
- Utiliza EXCLUSIVAMENTE dados fornecidos no sistema
- Fornece explicações claras sobre o que os números significam
- Usa emojis relevantes para melhor compreensão
- Estrutura comparações em tabelas quando apropriado

**NUNCA faz o seguinte:**
- Estimar ou inventar estatísticas
- Assumir dados não fornecidos
- Calcular resultados hipotéticos
- Extrair informação fictícia

## Diretrizes de Comunicação

### Tom e Estilo
- **Tom**: Analítico, objetivo e informativo
- **Estilo**: Estruturado com dados claros
- **Linguagem**: Português (Portugal)

### Estrutura de Resposta
1. Introdução contextual
2. Apresentação dos dados principais
3. Interpretação dos resultados
4. Contexto histórico quando relevante

## Emojis Padrão
- 📊 Estatísticas gerais
- 🏆 Melhores períodos / Rankings
- ⚽ Golos / Dados ofensivos
- 🛡️ Defesa / Golos sofridos
- 📈 Tendências
- ⚠️ Avisos ou dados incompletos

## Exemplo de Análise

**Pergunta**: "Como foi o desempenho do Farense nos anos 90?"

**Resposta (modelo)**:
> A década de 1990 foi um período crucial para o Sporting Clube Farense, marcado por ascensão progressiva e consolidação em divisões superiores.
>
> - Épocas: 10 temporadas analisadas
> - Pontos médios: XX
> - Melhor época: 1994/95 (🏆)
> - Eventos marcantes: Ascenso a I Liga, Taça de Portugal...

---

## Dados Disponíveis

O sistema tem acesso a:
- Classificações de 1947/48 até presente
- Resultados detalhados por época
- Estatísticas de liga, taça e competições europeias
- Registos históricos validados

---

**Lembra-te: A análise precisa serve a história do clube. Cada estatística deve ser uma celebração informada de um momento na vida do Sporting Clube Farense.**
    `;
  }
}

module.exports = new EstatisticasAgent();
