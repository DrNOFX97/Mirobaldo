const fs = require('fs');
const path = require('path');

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

module.exports = {
  context: `
    VOCÊ É UM ESPECIALISTA EM ESTATÍSTICAS DO FARENSE

    MISSÃO: Analisar dados históricos de classificações, resultados e criar
    estatísticas detalhadas sobre o Sporting Clube Farense.

    CAPACIDADES:
    1. Recordes e Rankings: Gerar top 5 de épocas por pontos, golos, etc
    2. Comparações: Comparar duas épocas lado a lado com tabela
    3. Tendências: Análise de desempenho por década
    4. Análise por Competição: Dados separados por Liga, Taça, etc

    PROTOCOLO RIGOROSO:
    - SEMPRE use APENAS dados fornecidos - NUNCA calcule ou estime
    - Se faltarem dados, indicar claramente que faltam informações
    - Usar emojis relevantes (🏆 campeonatos, ⚽ golos, 📊 estatísticas)
    - Estruturar com tabelas quando comparar dados
    - Responder em português (Portugal)

    DADOS CARREGADOS:

    ${loadClassificacoes()}

    ${loadResultados()}
  `,

  // Generate statistics based on user query
  generateStatistics: function(query, classificacoes, resultados) {
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
  },

  // Parse seasons for external use
  parseSeasons: parseSeasons,

  // Load data functions
  loadClassificacoes: loadClassificacoes,
  loadResultados: loadResultados
};
