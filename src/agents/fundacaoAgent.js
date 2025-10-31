const BaseAgent = require('../core/BaseAgent');
const fs = require('fs');
const path = require('path');

class FundacaoAgent extends BaseAgent {
  constructor() {
    super({
      name: 'FundacaoAgent',
      priority: 6,
      keywords: ['fundação', '1910', 'origem', 'história', 'fundado', 'como foi fundado'],
      enabled: true,
      context: '' // Will be set after loading
    });

    // Load the detailed founding history
    this.fundacaoContent = this.loadFundacaoContent();

    // Set the context property with the loaded content
    this.context = this.buildContext();
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

  buildContext() {
    if (this.fundacaoContent) {
      return `
## Informação Detalhada sobre a Fundação do Sporting Clube Farense

${this.fundacaoContent}

## Instruções ESSENCIAIS:
- RESPONDE COM DETALHES COMPLETOS usando APENAS as informações acima
- NUNCA MUDES a data de fundação: 1 de Abril de 1910 (Erro comum: muitas fontes dizem maio, mas a correta é ABRIL)
- Menciona SEMPRE os três fundadores principais: João de Jesus Gralho (Capitão Geral), António Guerreiro da Silva Gago (Sócio nº1), Francisco Rogério Dâmaso Tavares Bello (Primeiro Presidente)
- Explica o contexto histórico completo (República de 1910, influência do Sporting de Portugal)
- Descreve a origem do "team do Gralho" (jogos desde 1905, bola oferecida pelo Bispo)
- Menciona o local exato: Jardim Manuel Bivar, "montanha russa"
- NÃO inventas nenhuma informação
- USA EXCLUSIVAMENTE os dados fornecidos acima
- Se perguntarem sobre detalhes específicos, fornece respostas extensas e detalhadas
      `;
    }

    // Fallback context if file not loaded
    return `
    Contexto de Fundação - INFORMAÇÕES CORRIGIDAS:
    - O Sporting Clube Farense foi fundado a 1 de ABRIL de 1910 (não maio!), na cidade de Faro, Algarve.
    - João de Jesus Gralho foi o Capitão Geral (Capitão Mor) e figura fundamental na fundação do clube.
    - António Guerreiro da Silva Gago foi o sócio nº1 (primeiro associado do clube).
    - Francisco Rogério Dâmaso Tavares Bello foi o primeiro presidente oficial (1912-1917).
    - Em 1909, João Gralho e seus companheiros, com idades entre 13-17 anos, conviviam com militares e marinheiros em jogos no Largo de S. Francisco.
    - O clube evoluiu do informal "team do Gralho" que jogava desde ~1905.
    - As primeiras reuniões oficiais foram no Jardim Manuel Bivar, numa zona conhecida como "montanha russa".
    - O clube foi inicialmente chamado "Faro Futebol" e depois alterado para "Sporting de Faro" (depois Sporting Clube Farense), influenciado pelo Sporting de Portugal.
    - Havia aproximadamente 18-20 fundadores nomeados, incluindo membros das famílias Florindo e Moleiro.
    - As quotas eram um pataco por semana, mais tarde trinta réis.
    - Os equipamentos eram pagos pelos próprios jogadores.
    - Quando responderes sobre fundação: destaca sempre o papel de João Gralho e dos primeiros jogadores
    - SEMPRE refere as datas e nomes exactos do arquivo
    - NUNCA inventes informação
    - Se não tiveres certeza, diz "não tenho informação"
    `;
  }
}

module.exports = new FundacaoAgent();
