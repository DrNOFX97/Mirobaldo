const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

function getResultadosData() {
  try {
    let resultadosPath = path.join(__dirname, '../../netlify/data/resultados/resultados_completos.md');
    if (!fs.existsSync(resultadosPath)) {
      resultadosPath = path.join(__dirname, '../../dados/resultados/resultados_completos.md');
    }
    if (fs.existsSync(resultadosPath)) {
      return fs.readFileSync(resultadosPath, 'utf-8');
    }
  } catch (error) {
    console.error('[EPOCAS COMPLETO] Error reading resultados:', error);
  }
  return '';
}

function getClassificacoesData() {
  try {
    let classificacoesPath = path.join(__dirname, '../../netlify/data/classificacoes/classificacoes_completas.md');
    if (!fs.existsSync(classificacoesPath)) {
      classificacoesPath = path.join(__dirname, '../../dados/classificacoes/classificacoes_completas.md');
    }
    if (fs.existsSync(classificacoesPath)) {
      return fs.readFileSync(classificacoesPath, 'utf-8');
    }
  } catch (error) {
    console.error('[EPOCAS COMPLETO] Error reading classificacoes:', error);
  }
  return '';
}

class EpocasCompletoAgent extends BaseAgent {
  constructor() {
    super({
      name: 'EpocasCompletoAgent',
      priority: 6,
      keywords: ['época', 'temporada', 'season', 'campeonato', 'resultados de', 'classificação de'],
      enabled: true
    });
  }

  async process(message) {
    const msg = message.toLowerCase();

    // Extract season pattern (1939/40, 1939-40, 1939 40, etc)
    const seasonMatch = msg.match(/(19|20)(\d{2})[.\/-\s]?(\d{2})?/);

    if (!seasonMatch) {
      return null;
    }

    const year1 = seasonMatch[1] + seasonMatch[2];
    const year2 = seasonMatch[3];
    const searchPattern = year2 ? `${year1}/${year2}` : year1;

    console.log(`[EPOCAS COMPLETO] Processing season query for: ${searchPattern}`);

    try {
      const resultadosData = getResultadosData();
      const classificacoesData = getClassificacoesData();

      let consolidatedResponse = `# 📊 ÉPOCA ${searchPattern} - SPORTING CLUBE FARENSE\n\n`;

      // 1. Try to find classification/standings from classificacoes file
      // Look for main season entry and all subsections (Série Algarve, Fase Final, etc)
      const classifRegex = new RegExp(`###\\s+(?:.*\\s)?(?:${year1})[\\s/.-]?${year2}[^\\n]*[\\s\\S]*?(?=\\n###\\s+|$)`, 'gi');
      const classifMatches = classificacoesData.match(classifRegex);

      if (classifMatches && classifMatches.length > 0) {
        consolidatedResponse += `## 🏆 Classificação Final\n\n`;
        // Include all classification entries for this season
        classifMatches.forEach(match => {
          // Skip "Dados não disponíveis" entries, include actual tables
          if (!match.includes('(Dados não disponíveis)') || match.includes('|')) {
            consolidatedResponse += match + '\n\n';
          }
        });
      }

      // 2. Try to find all results for this season from resultados file
      // Look for all competitions in this season
      const competitionRegex = new RegExp(`###\\s+[^\\n]*${year1}[^\\n]*${year2}[^\\n]*[\\s\\S]*?(?=\\n###\\s+[^\\n]*(?:19|20)\\d{2}|$)`, 'gmi');
      const competitionMatches = resultadosData.match(competitionRegex);

      if (competitionMatches && competitionMatches.length > 0) {
        consolidatedResponse += `## 📋 Resultados Detalhados\n\n`;
        consolidatedResponse += competitionMatches.join('\n\n');
      }

      if (consolidatedResponse.length > 100) {
        return consolidatedResponse;
      }

      return null;
    } catch (error) {
      console.error('[EPOCAS COMPLETO] Error processing:', error.message);
      return null;
    }
  }

  getContext() {
    return `
# Assistente Completo de Épocas - Sporting Clube Farense

Combina classificações e resultados detalhados de todas as épocas do clube.
    `;
  }
}

module.exports = new EpocasCompletoAgent();
