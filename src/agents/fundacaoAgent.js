const BaseAgent = require('../core/BaseAgent');
const fs = require('fs');
const path = require('path');

class FundacaoAgent extends BaseAgent {
  constructor() {
    super({
      name: 'FundacaoAgent',
      priority: 6,
      keywords: ['fundação', '1910', 'origem', 'história', 'fundado', 'como foi fundado'],
      enabled: true
    });

    // Load the detailed founding history
    this.fundacaoContent = this.loadFundacaoContent();
  }

  loadFundacaoContent() {
    try {
      // Try to load from dados/historia/
      let fundacaoPath = path.join(__dirname, '../../dados/historia/fundacao_sporting_clube_farense.md');

      if (fs.existsSync(fundacaoPath)) {
        return fs.readFileSync(fundacaoPath, 'utf-8');
      }

      // Fallback to netlify data path
      fundacaoPath = path.join(__dirname, '../../netlify/data/historia/fundacao_sporting_clube_farense.md');
      if (fs.existsSync(fundacaoPath)) {
        return fs.readFileSync(fundacaoPath, 'utf-8');
      }

      return null;
    } catch (err) {
      console.warn('Could not load fundacao content:', err.message);
      return null;
    }
  }

  async process(message) {
    // Agent acts as context provider for GPT
    return null;
  }

  getContext() {
    if (this.fundacaoContent) {
      return `
## Informação Detalhada sobre a Fundação do Sporting Clube Farense

${this.fundacaoContent}

## Instruções:
- Fornece uma resposta DETALHADA usando APENAS as informações acima
- Menciona SEMPRE a data exata: 1 de Abril de 1910
- Menciona os fundadores principais: João de Jesus Gralho, António Guerreiro da Silva Gago, Francisco Rogério Dâmaso Tavares Bello
- Explica o contexto histórico
- Descreve a origem do "team do Gralho"
- Menciona o local da fundação: Jardim Manuel Bivar
- Não inventes nenhuma informação
- Usa APENAS os dados fornecidos acima
      `;
    }

    // Fallback context if file not loaded
    return `
    Contexto de Fundação:
    - O Sporting Clube Farense foi fundado a 1 de Abril de 1910 (não maio), na cidade de Faro, Algarve.
    - João de Jesus Gralho foi o Capitão Geral (Capitão Mor) e figura fundamental na fundação do clube.
    - António Guerreiro da Silva Gago foi o sócio nº1 (primeiro associado).
    - Francisco Rogério Dâmaso Tavares Bello foi o primeiro presidente oficial (1912-1917).
    - Em 1909, João Gralho e seus companheiros, com idades entre 13-17 anos, conviviam com militares e marinheiros em jogos no Largo de S. Francisco.
    - O clube evoluiu do informal "team do Gralho" que jogava desde ~1905.
    - As primeiras reuniões oficiais foram no Jardim Manuel Bivar, numa zona conhecida como "montanha russa".
    - O clube foi inicialmente chamado "Faro Futebol" e depois alterado para "Sporting de Faro" (depois Sporting Clube Farense).
    - Havia aproximadamente 18-20 fundadores, incluindo membros das famílias Florindo e Moleiro.
    - As quotas eram um pataco por semana, mais tarde trinta réis.
    - Os equipamentos eram pagos pelos próprios jogadores.
    - Quando falares sobre a fundação do clube, destaca sempre o papel de João Gralho e dos primeiros jogadores.
    - Refere sempre as datas e nomes exactos.
    - Não inventes informação.
    `;
  }
}

module.exports = new FundacaoAgent();
