const fs = require('fs');
const path = require('path');

function getResultadosData() {
  try {
    const resultadosPath = path.join(__dirname, '../../dados/resultados/resultados_para_agente.md');
    const resultadosTxtPath = path.join(__dirname, '../../dados/resultados/resultados.txt');

    let data = '';

    // Ler o ficheiro principal de resultados
    if (fs.existsSync(resultadosPath)) {
      data += fs.readFileSync(resultadosPath, 'utf-8');
      data += '\n\n';
    }

    // Extrair apenas resumos da Taça de Portugal para economizar tokens
    if (fs.existsSync(resultadosTxtPath)) {
      const resultadosTxt = fs.readFileSync(resultadosTxtPath, 'utf-8');

      // Extrair seções da Taça de Portugal
      const tacaSections = resultadosTxt.match(/Taça de Portugal \d{4}\/\d{4}[\s\S]*?(?=(?:Taça de Portugal \d{4}\/\d{4}|I Divisão|II Divisão|$))/g);

      if (tacaSections && tacaSections.length > 0) {
        data += '\n\nResumo da Taça de Portugal por época:\n';
        tacaSections.forEach(section => {
          // Extrair apenas o ano e os jogos importantes (QF, MF, F)
          const year = section.match(/Taça de Portugal (\d{4}\/\d{4})/)?.[1];
          const importantGames = section.match(/.*(?:QF|MF|F)[\s\S]*?$/gm);

          if (year) {
            data += `\n${year}:\n`;
            if (importantGames) {
              importantGames.forEach(game => {
                data += game + '\n';
              });
            }
          }
        });
      }
    }

    return data;
  } catch (error) {
    console.error('Erro ao ler ficheiros de resultados:', error);
    return '';
  }
}

module.exports = {
  context: `
    Contexto de Resultados do Sporting Clube Farense:

    ⚠️ REGRAS CRÍTICAS - ZERO TOLERÂNCIA PARA INVENÇÕES:
    - NUNCA inventes resultados, jogos ou épocas
    - Se uma época NÃO está listada abaixo, diz "Não tenho dados sobre a época X"
    - NUNCA suponhas resultados baseado em outras épocas
    - Se só tens dados da Taça, não fales do Campeonato dessa época
    - Cada época é ÚNICA - não confundas épocas diferentes

    Instruções específicas:
    1. Refere-te ao Farense como "os Leões de Faro" ou "o Sporting Clube Farense".
    2. Destaca a temporada 1994/1995 como a mais importante da história do clube, enfatizando a 5ª posição conquistada e a qualificação para a Taça UEFA.
    3. Para resultados históricos, menciona o contexto da época e a importância do jogo para o clube.
    4. Se perguntarem sobre um resultado específico que não encontras nos dados, diz claramente que não tens essa informação disponível.
    5. Ao responder sobre a Taça UEFA 1995/1996, enfatiza que foi a única participação do clube em competições europeias.
    6. O estádio do Farense é o Estádio de São Luís, com capacidade para aproximadamente 12.000 espectadores.
    7. Quando analisares dados da Taça de Portugal, presta atenção às eliminatórias (1/32, 1/16, 1/8, QF=Quartos de Final, MF=Meias-Finais, F=Final).
    8. Sê preciso nos resultados - verifica os dados cuidadosamente antes de responder.

    ${getResultadosData()}
  `
};
