/**
 * Roteador de Agents
 *
 * Gerencia a seleção e roteamento para agentes especializados baseado
 * em palavras-chave e prioridades.
 */
class AgentRouter {
  constructor() {
    this.agents = [];
    this.fallbackAgent = null;
  }

  /**
   * Registra um agent no roteador
   * @param {BaseAgent} agent - Instância do agent a registrar
   * @param {number} priority - Prioridade de seleção (0-10, maior = mais prioritário)
   */
  register(agent, priority = agent.priority ?? 5) {
    if (!agent.name) {
      throw new Error('Agent deve ter um nome');
    }

    this.agents.push({
      agent,
      priority,
    });

    // Manter agentes ordenados por prioridade (descendente)
    this.agents.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Define o agent de fallback (usado quando nenhum agent específico é selecionado)
   * @param {Function} fallbackFn - Função que retorna resposta genérica
   */
  setFallback(fallbackFn) {
    this.fallbackAgent = fallbackFn;
  }

  /**
   * Encontra e retorna o melhor agent para processar a mensagem
   * @param {string} message - Mensagem do usuário
   * @returns {Object} {agent, priority} ou null se nenhum agent apropriado
   */
  findAgent(message) {
    for (const { agent, priority } of this.agents) {
      if (agent.enabled && agent.canHandle(message)) {
        return { agent, priority };
      }
    }
    return null;
  }

  /**
   * Processa a mensagem com o agent apropriado
   * @param {string} message - Mensagem do usuário
   * @returns {Promise<string|null>} Resposta ou null
   */
  async route(message) {
    // Encontrar agent mais apropriado
    const result = this.findAgent(message);

    if (result) {
      try {
        return await result.agent.process(message);
      } catch (error) {
        console.error(`Erro ao processar com ${result.agent.name}:`, error);
        return null;
      }
    }

    // Sem agent específico, usar fallback
    if (this.fallbackAgent) {
      return await this.fallbackAgent(message);
    }

    return null;
  }

  /**
   * Retorna informações sobre todos os agents registrados
   * @returns {Array} Lista com metadados de cada agent
   */
  getAgentsInfo() {
    return this.agents.map(({ agent, priority }) => ({
      name: agent.name,
      priority,
      enabled: agent.enabled,
      keywords: agent.keywords,
      contextLength: agent.context.length,
    }));
  }

  /**
   * Ativa/desativa um agent
   * @param {string} agentName - Nome do agent
   * @param {boolean} enabled - True para ativar, false para desativar
   */
  toggleAgent(agentName, enabled = true) {
    const agentObj = this.agents.find(a => a.agent.name === agentName);
    if (agentObj) {
      agentObj.agent.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Muda a prioridade de um agent
   * @param {string} agentName - Nome do agent
   * @param {number} newPriority - Nova prioridade
   */
  setPriority(agentName, newPriority) {
    const agentObj = this.agents.find(a => a.agent.name === agentName);
    if (agentObj) {
      agentObj.priority = newPriority;
      // Re-ordenar
      this.agents.sort((a, b) => b.priority - a.priority);
      return true;
    }
    return false;
  }

  /**
   * Log de debug: mostra agents disponíveis e suas prioridades
   */
  debug() {
    console.log('\n📊 AgentRouter Status:');
    console.log('━'.repeat(60));

    if (this.agents.length === 0) {
      console.log('❌ Nenhum agent registrado');
      return;
    }

    this.agents.forEach(({ agent, priority }, index) => {
      const status = agent.enabled ? '✅' : '❌';
      console.log(`${index + 1}. ${status} [${priority}] ${agent.name}`);
      console.log(`   Keywords: ${agent.keywords.join(', ') || 'Nenhuma'}`);
    });

    console.log('━'.repeat(60));
    if (this.fallbackAgent) {
      console.log('⚡ Fallback: Ativado');
    }
    console.log('\n');
  }
}

module.exports = AgentRouter;
