const fs = require('fs');
const path = require('path');
const BaseAgent = require('../core/BaseAgent');

function getJogadoresData() {
  try {
    const jogadoresDir = path.join(__dirname, '../../dados/jogadores');
    let data = '\n\nDados completos sobre jogadores:\n\n';

    if (fs.existsSync(jogadoresDir)) {
      const files = fs.readdirSync(jogadoresDir);

      // Carregar apenas ficheiros .md (formatados e concisos)
      files.filter(f => f.endsWith('.md')).forEach(file => {
        const filePath = path.join(jogadoresDir, file);
        if (fs.statSync(filePath).isFile()) {
          data += `\n--- ${file} ---\n`;
          data += fs.readFileSync(filePath, 'utf-8');
          data += '\n\n';
        }
      });
    }

    return data;
  } catch (error) {
    console.error('Erro ao ler ficheiros de jogadores:', error);
    return '';
  }
}

class JogadoresAgent extends BaseAgent {
  constructor() {
    super({
      name: 'JogadoresAgent',
      priority: 6,
      keywords: ['plantel', 'equipa', 'jogador', 'número'],
      enabled: true
    });
  }

  async process(message) {
    // Agent acts as context provider for GPT
    return null;
  }

  getContext() {
    return `
    Contexto de Jogadores do Sporting Clube Farense:

    ⚠️ REGRAS CRÍTICAS - ZERO TOLERÂNCIA PARA INVENÇÕES:
    - NUNCA inventes jogadores ou estatísticas
    - Se um jogador NÃO está listado abaixo, diz "Não tenho informação sobre o jogador [nome]"
    - NUNCA suponhas posições, épocas ou estatísticas
    - Usa APENAS os dados de jogadores fornecidos abaixo

    Instruções específicas:
    1. Refere-te ao Farense como "os Leões de Faro" ou "o Sporting Clube Farense".
    2. Destaca os jogadores mais emblemáticos como Hassan Nader, Paco Fortes, Jorge Soares, João Gralho e António Gago.
    3. Para jogadores históricos, menciona sempre o contexto da época em que jogaram.
    4. Se perguntarem sobre um jogador que não está nos dados, diz claramente que não tens informação detalhada.
    5. Mantém um tom entusiasta ao falar sobre os jogadores do clube.

    ${getJogadoresData()}
    `;
  }
}

module.exports = new JogadoresAgent();
