const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

function getResultadosData() {
  try {
    // Try netlify/data first (for Netlify deployment)
    let completosPath = path.join(__dirname, '../../netlify/data/resultados/resultados_completos.md');

    // Fallback to dados directory (for local development)
    if (!fs.existsSync(completosPath)) {
      completosPath = path.join(__dirname, '../../dados/resultados/resultados_completos.md');
    }

    let data = '';

    // Ler o ficheiro completo de resultados
    if (fs.existsSync(completosPath)) {
      data += fs.readFileSync(completosPath, 'utf-8');
    } else {
      console.warn('[RESULTADOS AGENT] Complete results file not found at:', completosPath);
      // Fallback to para_agente version if completos not available
      let paraAgentePath = path.join(__dirname, '../../netlify/data/resultados/resultados_para_agente.md');
      if (!fs.existsSync(paraAgentePath)) {
        paraAgentePath = path.join(__dirname, '../../dados/resultados/resultados_para_agente.md');
      }
      if (fs.existsSync(paraAgentePath)) {
        data += fs.readFileSync(paraAgentePath, 'utf-8');
      }
    }

    return data;
  } catch (error) {
    console.error('Erro ao ler ficheiros de resultados:', error);
    return '';
  }
}

class ResultadosAgent extends BaseAgent {
  constructor() {
    super({
      name: 'ResultadosAgent',
      priority: 8,
      keywords: ['resultado', 'golo', 'vitória', 'derrota', 'empate', 'jogo', 'taça', 'liga', 'competição'],
      enabled: true
    });
  }

  async process(message) {
    // Try to extract season from message (e.g., "resultados de 1991-92" -> "1991/92")
    const msg = message.toLowerCase();
    const seasonMatch = msg.match(/(\d{4})[.-]?(\d{2})/);

    if (seasonMatch) {
      const year1 = seasonMatch[1];
      const year2 = seasonMatch[2];
      const seasons = [
        `${year1}/${year2}`,
        `${year1}-${year2}`,
        `Época ${year1}/${year2}`,
        `Temporada ${year1}/${year2}`
      ];

      try {
        // Read the complete data file
        let completosPath = path.join(__dirname, '../../netlify/data/resultados/resultados_completos.md');
        if (!fs.existsSync(completosPath)) {
          completosPath = path.join(__dirname, '../../dados/resultados/resultados_completos.md');
        }

        if (fs.existsSync(completosPath)) {
          const data = fs.readFileSync(completosPath, 'utf-8');

          // Search for the season in the file
          for (const season of seasons) {
            // Look for sections with this season (case-insensitive)
            const regex = new RegExp(`^(#{1,4})\\s+.*?${season.replace(/\//g, '\\/')}.*?$`, 'gmi');
            const match = data.match(regex);

            if (match) {
              // Extract the section for this season
              const startIdx = data.indexOf(match[0]);
              if (startIdx !== -1) {
                // Find the next section at the same or higher level
                const sectionLevel = match[0].match(/^#+/)[0].length;
                const endRegex = new RegExp(`^#{1,${sectionLevel}}\\s+`, 'gm');
                const remaining = data.substring(startIdx + match[0].length);
                const nextSectionMatch = remaining.match(endRegex);

                let endIdx = data.length;
                if (nextSectionMatch) {
                  endIdx = startIdx + match[0].length + remaining.indexOf(nextSectionMatch[0]);
                }

                const seasonData = data.substring(startIdx, endIdx).trim();
                if (seasonData.length > 50) {
                  // Found detailed season data, return it
                  return seasonData;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('[RESULTADOS AGENT] Error processing message:', error.message);
      }
    }

    // No season found or season not in data
    return null;
  }

  getContext() {
    return `
# Assistente de Resultados do Sporting Clube Farense

## Identidade e Missão
Especialista em resultados históricos do Sporting Clube Farense. Fornece informação precisa e contextualizada sobre jogos, competições e desempenho do clube.

## Protocolos Rigorosos de Precisão Factual

### ⚠️ POLÍTICA DE ZERO TOLERÂNCIA PARA INVENÇÕES

**NUNCA FAÇAS o seguinte:**
- Inventar resultados, jogos ou épocas
- Supor resultados baseado em outras épocas
- Confundir dados entre épocas diferentes
- Falar do Campeonato se só tens dados da Taça

**SEMPRE FAZE o seguinte:**
- Citar EXCLUSIVAMENTE dados fornecidos
- Se época não está listada, diz "Não tenho dados sobre a época X"
- Manter rigor histórico absoluto
- Indicar claramente quando não tens informação

## Diretrizes de Comunicação

### 1. Terminologia
- Refere-te ao Farense como "os Leões de Faro" ou "o Sporting Clube Farense"
- O estádio é "Estádio de São Luís" (capacidade: ~12.000 espectadores)

### 2. Épocas Importantes
- **1994/95**: Temporada mais importante da história
  - 5ª posição conquistada
  - Qualificação para Taça UEFA
  - Participação histórica em competições europeias

- **1995/96**: Única participação europeia (Taça UEFA)

### 3. Taça de Portugal - Formato
- 1/32: Primeira eliminatória
- 1/16: Segunda eliminatória
- 1/8: Quartos de Final (octavos)
- QF: Quartos de Final
- MF: Meias-Finais
- F: Final

### 4. Estrutura de Resposta
Para resultados:
1. Identificação do jogo/época
2. Contexto histórico
3. Resultado e consequências
4. Legado quando apropriado

## Dados Resultados

${getResultadosData()}

---

**Lembra-te: Cada resultado é parte da história do Sporting Clube Farense. Precisão factual é essencial.**
    `;
  }
}

module.exports = new ResultadosAgent();
