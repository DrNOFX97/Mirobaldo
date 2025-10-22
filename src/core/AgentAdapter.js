/**
 * Agent Adapter
 *
 * Adapts legacy agents (non-BaseAgent) to the new BaseAgent interface
 * without modifying their original code.
 *
 * This allows gradual migration of agents while maintaining backward compatibility.
 */

const BaseAgent = require('./BaseAgent');

class AgentAdapter extends BaseAgent {
  /**
   * Cria um adapter para um agent legado
   * @param {Object} legacyAgent - Agent legado com métodos como searchBiografias, generateStatistics, etc.
   * @param {Object} config - Configuração padrão de BaseAgent
   */
  constructor(legacyAgent, config) {
    super(config);
    this.legacyAgent = legacyAgent;
  }

  /**
   * Processa a mensagem delegando ao método apropriado do agent legado
   * @param {string} message - Mensagem do usuário
   * @returns {Promise<string|null>} Resposta ou null
   */
  async process(message) {
    // Tentar encontrar o método apropriado no agent legado
    if (this.legacyAgent.process) {
      // Agent legado com método process
      return await this.legacyAgent.process(message);
    }

    if (this.legacyAgent.searchBiografias) {
      // Biografias agent
      const results = this.legacyAgent.searchBiografias(message);
      if (results && results.length > 0) {
        return results[0].content;
      }
      return null;
    }

    if (this.legacyAgent.generateStatistics) {
      // Estatísticas agent
      return await this.legacyAgent.generateStatistics(message);
    }

    if (this.legacyAgent.generateReport) {
      // Época detalhada agent
      const epocaMatch = message.match(/\b(\d{2,4})[\/-](\d{2,4})\b/);
      if (epocaMatch) {
        return this.legacyAgent.generateReport(epocaMatch[0]);
      }
      return null;
    }

    // Se não encontrar método, retornar null para fallback
    return null;
  }

  /**
   * Retorna o contexto do agent legado, se disponível
   * @returns {string} Contexto
   */
  getContext() {
    if (this.legacyAgent.context) {
      return this.legacyAgent.context;
    }
    return super.getContext();
  }
}

module.exports = AgentAdapter;
