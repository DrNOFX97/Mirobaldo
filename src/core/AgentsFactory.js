/**
 * Fábrica de Agents
 *
 * Centraliza a inicialização e configuração de todos os agentes
 * do sistema de chatbot.
 *
 * NOTA: Usa o padrão Adapter para envolver agents legados com a interface BaseAgent.
 * Isso permite que todos os agents ganhem benefícios imediatos sem modificar código legado.
 */

const AgentRouter = require('./AgentRouter');
const AgentAdapter = require('./AgentAdapter');

// Importar todos os agents legados
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
 * @returns {AgentRouter} Router configurado com todos os agents adaptados
 */
function createRouter() {
  const router = new AgentRouter();

  // Registar agents com suas prioridades
  // Agentes mais específicos têm maior prioridade
  // PADRÃO ADAPTER: Cada agent legado é envolvido com AgentAdapter

  // PRIORIDADE CRÍTICA (10) - Padrões temporais com formatos específicos
  // EpocaDetalhadaAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(epocaDetalhadaAgent, 10);

  // PRIORIDADE ALTA (9-8) - Agentes muito específicos com palavras-chave únicas
  // EstatisticasAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(estatisticasAgent, 9);

  // LivroConteudoAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(livroConteudoAgent, 9);

  // ResultadosAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(resultadosAgent, 8);

  // ClassificacoesAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(classificacoesAgent, 8);

  // PRIORIDADE MÉDIA (6-7) - Agentes padrão
  // BiografiasAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(biografiasAgent, 7);

  // PresidentesAgent foi refatorado para estender BaseAgent diretamente (Phase 2b)
  router.register(presidentesAgent, 6);

  router.register(
    new AgentAdapter(fundacaoAgent, {
      name: 'FundacaoAgent',
      priority: 6,
      keywords: fundacaoAgent.keywords || ['fundação', '1910', 'origem', 'história', 'fundado'],
      enabled: true
    }),
    6
  );

  router.register(
    new AgentAdapter(jogadoresAgent, {
      name: 'JogadoresAgent',
      priority: 6,
      keywords: jogadoresAgent.keywords || ['plantel', 'equipa', 'jogador', 'número'],
      enabled: true
    }),
    6
  );

  router.register(
    new AgentAdapter(epocasAgent, {
      name: 'EpocasAgent',
      priority: 6,
      keywords: epocasAgent.keywords || ['época', 'ano', 'temporada', 'campeonato'],
      enabled: true
    }),
    6
  );

  // PRIORIDADE BAIXA (5) - Agentes genéricos
  router.register(
    new AgentAdapter(livrosAgent, {
      name: 'LivrosAgent',
      priority: 5,
      keywords: livrosAgent.keywords || ['livro', 'livros', 'biblioteca', 'bibliográfico'],
      enabled: true
    }),
    5
  );

  return router;
}

module.exports = {
  createRouter,
};
