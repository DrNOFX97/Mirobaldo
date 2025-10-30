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
      // Look for sections with actual classification tables (containing |)
      // Match both abbreviated (1939/40) and full (1939/1940) year formats
      const classifRegex = new RegExp(`###\\s+[^\\n]*${year1}[\\s/.-](?:${year2}|1${year2})[^\\n]*\\n[^\\n]*\\|[\\s\\S]*?(?=\\n###\\s+|$)`, 'gi');
      const classifMatches = classificacoesData.match(classifRegex);

      if (classifMatches && classifMatches.length > 0) {
        consolidatedResponse += `## 🏆 Classificação Final\n\n`;
        // Include all actual classification tables found
        classifMatches.forEach(match => {
          consolidatedResponse += match + '\n\n';
        });
      } else {
        // No specific classification found, check if data is available
        const noDataCheck = classificacoesData.match(new RegExp(`###\\s+[^\\n]*${year1}[\\s/.-](?:${year2}|1${year2})[^\\n]*\\n\\(Dados não disponíveis\\)`, 'i'));
        if (noDataCheck) {
          consolidatedResponse += `## 🏆 Classificação Final\n(Dados não disponíveis para a época ${searchPattern})\n\n`;
        }
      }

      // 2. Try to find all results for this season from resultados file
      // Look for all competitions in this season
      // Match both abbreviated (1939/40) and full (1939/1940) year formats
      const competitionRegex = new RegExp(`###\\s+[^\\n]*${year1}[^\\n]*(?:${year2}|1${year2})[^\\n]*[\\s\\S]*?(?=\\n###\\s+[^\\n]*(?:19|20)\\d{2}|$)`, 'gmi');
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
