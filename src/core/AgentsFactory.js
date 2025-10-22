/**
 * Fábrica de Agents
 *
 * Centraliza a inicialização e configuração de todos os agentes
 * do sistema de chatbot.
 */

const AgentRouter = require('./AgentRouter');

// Importar todos os agents
const biografiasAgent = require('../agents/biografiasAgent');
const epocaDetalhadaAgent = require('../agents/epocaDetalhadaAgent');
const estatisticasAgent = require('../agents/estatisticasAgent');
const classificacoesAgent = require('../agents/classificacoesAgent');
const resultadosAgent = require('../agents/resultadosAgent');
const livrosAgent = require('../agents/livrosAgent');
const livroConteudoAgent = require('../agents/livroConteudoAgent');
const jogadoresAgent = require('../agents/jogadoresAgent');
const presidentesAgent = require('../agents/presidentesAgent');
const fundacaoAgent = require('../agents/fundacaoAgent');
const epocasAgent = require('../agents/epocasAgent');

/**
 * Cria e configura o roteador de agents
 * @returns {AgentRouter} Router configurado com todos os agents
 */
function createRouter() {
  const router = new AgentRouter();

  // Registar agents com suas prioridades
  // Agentes mais específicos têm maior prioridade

  // PRIORIDADE CRÍTICA (10) - Padrões temporais com formatos específicos
  // Estes detectam épocas (ex: 1989/90, 89/90) e devem ser processados primeiro
  router.register(epocaDetalhadaAgent, 10);

  // PRIORIDADE ALTA (9-8) - Agentes muito específicos com palavras-chave únicas
  router.register(estatisticasAgent, 9);
  router.register(livroConteudoAgent, 9);
  router.register(resultadosAgent, 8);
  router.register(classificacoesAgent, 8);

  // PRIORIDADE MÉDIA (6-7) - Agentes padrão
  router.register(biografiasAgent, 7);
  router.register(presidentesAgent, 6);
  router.register(fundacaoAgent, 6);
  router.register(jogadoresAgent, 6);
  router.register(epocasAgent, 6);

  // PRIORIDADE BAIXA (5) - Agentes genéricos
  router.register(livrosAgent, 5);

  return router;
}

module.exports = {
  createRouter,
};
