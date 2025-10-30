const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

function getClassificacoesData() {
  try {
    // Try netlify/data first (for Netlify deployment)
    let classificacoesPath = path.join(__dirname, '../../netlify/data/classificacoes/classificacoes_completas.md');

    // Fallback to dados directory (for local development)
    if (!fs.existsSync(classificacoesPath)) {
      classificacoesPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');
    }

    let data = '';

    // Read the complete classifications file
    if (fs.existsSync(classificacoesPath)) {
      data += fs.readFileSync(classificacoesPath, 'utf-8');
    } else {
      console.warn('[CLASSIFICACOES AGENT] Complete classifications file not found at:', classificacoesPath);
      return '';
    }

    return data;
  } catch (error) {
    console.error('Erro ao ler ficheiro de classificações:', error);
    return '';
  }
}

class ClassificacoesAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ClassificacoesAgent',
      priority: 7,
      keywords: ['classificação', 'classificacoes', 'posição', 'posicao', 'tabela', 'league', 'standings', 'ranking', 'pontos', 'campeão', 'campeao'],
      enabled: true
    });
  }

  async process(message) {
    const msg = message.toLowerCase();

    // Try to extract season from message (e.g., "classificação de 1994/95" -> "1994/95")
    const seasonMatch = msg.match(/(19|20)\d{2}[\/-]?(\d{2})?/i);

    // Check if it's asking about standings/classifications
    const isClassificationQuery = /classif|tabela|standing|posição|pontos|campeão|league table/i.test(msg);

    if (isClassificationQuery) {
      try {
        const data = getClassificacoesData();

        if (seasonMatch && seasonMatch[0]) {
          // Extract the full season string
          const year1 = seasonMatch[1] + seasonMatch[2];
          const year2 = seasonMatch[3];

          let searchPattern;
          if (year2) {
            searchPattern = `${year1}/${year2}`;
          } else {
            searchPattern = year1;
          }

          // Search for the season in the data
          const seasonRegex = new RegExp(`###\\s+[^\\n]*${searchPattern}[^\\n]*`, 'i');
          const seasonMatchResult = data.match(seasonRegex);

          if (seasonMatchResult) {
            // Found the season header - extract everything until the next season
            const seasonIndex = data.indexOf(seasonMatchResult[0]);
            const afterSeason = data.substring(seasonIndex);

            // Find next season header (### or ##)
            const nextSectionMatch = afterSeason.substring(seasonMatchResult[0].length).match(/\n###\s/);
            let endIndex;

            if (nextSectionMatch) {
              endIndex = seasonIndex + seasonMatchResult[0].length + afterSeason.substring(seasonMatchResult[0].length).indexOf(nextSectionMatch[0]);
            } else {
              endIndex = data.length;
            }

            const seasonData = data.substring(seasonIndex, endIndex).trim();

            if (seasonData.length > 50) {
              console.log(`[CLASSIFICACOES AGENT] Found season data for ${searchPattern}`);
              return seasonData;
            }
          }
        } else {
          // No specific season mentioned - return general info
          const statsMatch = data.match(/### 📈 Estatísticas Gerais[\s\S]*?---/);
          if (statsMatch) {
            return statsMatch[0];
          }
        }
      } catch (error) {
        console.error('[CLASSIFICACOES AGENT] Error processing message:', error.message);
      }
    }

    // No classification found
    return null;
  }

  getContext() {
    return `
# Assistente de Classificações do Sporting Clube Farense

## Dados Classificações

${getClassificacoesData()}
    `;
  }
}

module.exports = new ClassificacoesAgent();
