/**
 * Classe Base para todos os Agents
 *
 * Fornece interface comum para todos os agentes especializados
 * Implementa padrão de herança e métodos essenciais
 */
class BaseAgent {
  /**
   * Construtor do Agent
   * @param {Object} config - Configuração do agent
   * @param {string} config.name - Nome do agent
   * @param {string} config.context - Contexto do sistema para o GPT
   * @param {number} config.priority - Prioridade (0-10, maior = maior prioridade)
   * @param {Array<string>} config.keywords - Palavras-chave para detecção
   */
  constructor(config = {}) {
    this.name = config.name || 'UnnamedAgent';
    this.context = config.context || '';
    this.priority = config.priority ?? 5;
    this.keywords = config.keywords || [];
    this.enabled = config.enabled ?? true;
  }

  /**
   * Verifica se este agent pode processar a mensagem
   * @param {string} message - Mensagem do usuário
   * @returns {boolean} True se pode processar
   */
  canHandle(message) {
    if (!this.enabled) return false;

    const lowerMessage = message.toLowerCase();
    return this.keywords.some(kw => lowerMessage.includes(kw.toLowerCase()));
  }

  /**
   * Processa a mensagem
   * @param {string} message - Mensagem do usuário
   * @returns {Promise<string|null>} Resposta ou null se não conseguir processar
   */
  async process(message) {
    throw new Error(`${this.name}.process() deve ser implementado`);
  }

  /**
   * Retorna o contexto do agent para o GPT
   * @returns {string} Contexto do sistema
   */
  getContext() {
    return this.context;
  }

  /**
   * Log com prefixo do agent
   * @param {string} message - Mensagem
   * @param {string} type - Tipo: 'info', 'warn', 'error'
   */
  log(message, type = 'info') {
    const prefix = `[${this.name}]`;
    const timestamp = new Date().toISOString().substring(11, 19);

    switch (type) {
      case 'error':
        console.error(`${timestamp} ❌ ${prefix}`, message);
        break;
      case 'warn':
        console.warn(`${timestamp} ⚠️  ${prefix}`, message);
        break;
      case 'info':
      default:
        console.log(`${timestamp} ℹ️  ${prefix}`, message);
    }
  }

  /**
   * Valida se agent está configurado corretamente
   * @returns {boolean} True se válido
   */
  validate() {
    if (!this.name) {
      this.log('Name é obrigatório', 'error');
      return false;
    }
    if (!this.context) {
      this.log('Context é recomendado', 'warn');
    }
    if (this.keywords.length === 0) {
      this.log('Keywords vazias - agent pode nunca ser selecionado', 'warn');
    }
    return true;
  }

  /**
   * Retorna informações sobre o agent
   * @returns {Object} Metadados
   */
  getMetadata() {
    return {
      name: this.name,
      priority: this.priority,
      enabled: this.enabled,
      keywords: this.keywords,
      contextLength: this.context.length,
    };
  }
}

module.exports = BaseAgent;
