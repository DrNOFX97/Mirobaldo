/**
 * Biography Scorer - Extrai critérios das biografias para ranking
 * Critérios: tempo como sénior, número de jogos, importância biográfica
 */

function extractYearsOfService(content) {
  // Procura por padrões como "1920-1930", "entre 1920 e 1930", "de 1920 a 1930"
  const datePatterns = [
    /(\d{4})[–-](\d{4})/g, // 1920-1930
    /entre\s+(\d{4})\s+e\s+(\d{4})/gi,
    /de\s+(\d{4})\s+a\s+(\d{4})/gi,
    /desde\s+(\d{4})/gi,
  ];

  let startYear = null;
  let endYear = null;

  // Procura por datas de carreira
  for (const pattern of datePatterns) {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1]) startYear = parseInt(match[1]);
      if (match[2]) endYear = parseInt(match[2]);
      if (endYear) break; // Se encontrou range completo, usa este
    }
  }

  // Se só encontrou start year, assume até aos dias atuais
  if (startYear && !endYear) {
    endYear = new Date().getFullYear();
  }

  if (startYear && endYear) {
    return Math.max(0, endYear - startYear);
  }

  return 0;
}

function extractNumberOfGames(content) {
  // Procura por padrões como "123 jogos", "123 matches", "123 partidas"
  const gamePatterns = [
    /(\d+)\s*jogos/gi,
    /(\d+)\s*partidas/gi,
    /(\d+)\s*matches/gi,
    /(\d+)\s*aparições/gi,
    /disputou\s*(\d+)\s*(jogos|partidas|matches)/gi,
    /realizou\s*(\d+)\s*(jogos|partidas|matches)/gi,
  ];

  for (const pattern of gamePatterns) {
    const match = content.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        return parseInt(numbers[numbers.length - 1]);
      }
    }
  }

  return 0;
}

function extractBiographicImportance(content, name) {
  let score = 0;

  // Comprimento do conteúdo (mais conteúdo = mais importante)
  score += Math.min(content.length / 100, 30); // Máx 30 pontos

  // Verificar títulos/seções importantes
  const importantKeywords = [
    'presidente', 'fundador', 'treinador', 'capitão', 'lenda',
    'ícone', 'herói', 'mito', 'símbolo', 'símbolo histórico',
    'maior', 'melhor', 'primeira', 'primeiro', 'rekord',
    'campeão', 'campeonato', 'título', 'taça', 'troféu',
  ];

  const lowerContent = content.toLowerCase();
  importantKeywords.forEach(keyword => {
    const count = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
    score += Math.min(count * 2, 10); // Máx 10 pontos por keyword
  });

  // Verificar se tem headings (estrutura melhor = mais importante)
  const headings = (content.match(/^#+\s/gm) || []).length;
  score += Math.min(headings * 3, 15); // Máx 15 pontos

  // Verificar se tem imagem
  if (content.includes('<img') || content.includes('![')) {
    score += 10;
  }

  // Verificar se tem dados estatísticos
  if (content.match(/\d+\s*(gol|golo|assit|passe|cartão)/i)) {
    score += 5;
  }

  return Math.min(score, 100); // Máx 100 pontos
}

function scoreBiography(bio) {
  const yearsOfService = extractYearsOfService(bio.content);
  const numberOfGames = extractNumberOfGames(bio.content);
  const biographicImportance = extractBiographicImportance(bio.content, bio.name);

  // Calcular score normalizado (0-100)
  // Ponderação: 30% anos, 30% jogos, 40% importância biográfica
  const maxYears = 50; // Máximo esperado
  const maxGames = 500; // Máximo esperado

  const normalizedYears = Math.min(yearsOfService / maxYears, 1) * 30;
  const normalizedGames = Math.min(numberOfGames / maxGames, 1) * 30;
  const totalScore = normalizedYears + normalizedGames + (biographicImportance * 0.4);

  return {
    name: bio.name,
    score: Math.round(totalScore * 10) / 10, // 1 casa decimal
    yearsOfService,
    numberOfGames,
    biographicImportance: Math.round(biographicImportance),
    subfolder: bio.subfolder,
  };
}

function getTopPersonalities(biografiasData, count = 10) {
  // Converter object para array e fazer scoring
  const scores = Object.values(biografiasData)
    .map(bio => scoreBiography(bio))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);

  return scores;
}

module.exports = {
  scoreBiography,
  getTopPersonalities,
  extractYearsOfService,
  extractNumberOfGames,
  extractBiographicImportance,
};
