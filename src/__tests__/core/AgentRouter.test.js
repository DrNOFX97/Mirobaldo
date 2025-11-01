/**
 * AgentRouter Unit Tests
 * Tests the centralized routing system for all agents
 */

const AgentRouter = require('../../core/AgentRouter');
const BaseAgent = require('../../core/BaseAgent');

describe('AgentRouter', () => {
  let router;

  beforeEach(() => {
    router = new AgentRouter();
  });

  describe('Agent Registration', () => {
    it('should register an agent', () => {
      const mockAgent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test', 'demo']
      });

      router.register(mockAgent, 5);
      expect(router.agents.length).toBe(1);
    });

    it('should throw error if agent has no name', () => {
      const invalidAgent = { priority: 5 };
      expect(() => router.register(invalidAgent, 5)).toThrow('Agent deve ter um nome');
    });

    it('should sort agents by priority (descending)', () => {
      const agent1 = new BaseAgent({ name: 'Agent1', priority: 3, keywords: ['a'] });
      const agent2 = new BaseAgent({ name: 'Agent2', priority: 9, keywords: ['b'] });
      const agent3 = new BaseAgent({ name: 'Agent3', priority: 5, keywords: ['c'] });

      router.register(agent1, 3);
      router.register(agent2, 9);
      router.register(agent3, 5);

      expect(router.agents[0].agent.name).toBe('Agent2'); // priority 9
      expect(router.agents[1].agent.name).toBe('Agent3'); // priority 5
      expect(router.agents[2].agent.name).toBe('Agent1'); // priority 3
    });

    it('should use agent priority if not specified in register', () => {
      const agent = new BaseAgent({ name: 'TestAgent', priority: 7, keywords: [] });
      router.register(agent); // No priority specified
      expect(router.agents[0].priority).toBe(7);
    });
  });

  describe('Agent Finding', () => {
    beforeEach(() => {
      const agent1 = new BaseAgent({
        name: 'EpocaAgent',
        priority: 10,
        keywords: ['época', 'temporada']
      });
      const agent2 = new BaseAgent({
        name: 'ResultadosAgent',
        priority: 8,
        keywords: ['resultado', 'jogo']
      });
      const agent3 = new BaseAgent({
        name: 'FallbackAgent',
        priority: 1,
        keywords: ['anything']
      });

      router.register(agent1, 10);
      router.register(agent2, 8);
      router.register(agent3, 1);
    });

    it('should find agent by keyword match', () => {
      const result = router.findAgent('qual foi a época de 1990/91?');
      expect(result).not.toBeNull();
      expect(result.agent.name).toBe('EpocaAgent');
      expect(result.priority).toBe(10);
    });

    it('should select highest priority agent when multiple match', () => {
      // Create scenario where multiple agents could match
      const agent1 = new BaseAgent({ name: 'HighPriority', priority: 10, keywords: ['test'] });
      const agent2 = new BaseAgent({ name: 'LowPriority', priority: 5, keywords: ['test'] });

      router.agents = []; // Clear previous agents
      router.register(agent1, 10);
      router.register(agent2, 5);

      const result = router.findAgent('test message');
      expect(result.agent.name).toBe('HighPriority');
    });

    it('should return null if no agent matches', () => {
      const result = router.findAgent('xyz xyz xyz unmatched content');
      expect(result).toBeNull();
    });

    it('should respect enabled flag', () => {
      // Disable the highest priority agent
      router.agents[0].agent.enabled = false;

      const result = router.findAgent('qual foi a época?');
      // Should now match the next available agent or return null
      expect(result === null || result.agent.name !== 'EpocaAgent').toBe(true);
    });
  });

  describe('Agent Routing', () => {
    it('should route message through agent', async () => {
      const mockAgent = new BaseAgent({
        name: 'MockAgent',
        priority: 5,
        keywords: ['mock']
      });

      mockAgent.process = jest.fn().mockResolvedValue('Mock response');

      router.register(mockAgent, 5);
      const result = await router.route('mock message');

      expect(mockAgent.process).toHaveBeenCalledWith('mock message');
      expect(result).toBe('Mock response');
    });

    it('should return null if no agent found and no fallback', async () => {
      const result = await router.route('unmatched message');
      expect(result).toBeNull();
    });

    it('should use fallback if no agent matches', async () => {
      const fallbackFn = jest.fn().mockResolvedValue('Fallback response');
      router.setFallback(fallbackFn);

      const result = await router.route('unmatched message');
      expect(result).toBe('Fallback response');
    });

    it('should handle agent error gracefully', async () => {
      const errorAgent = new BaseAgent({
        name: 'ErrorAgent',
        priority: 5,
        keywords: ['error']
      });

      errorAgent.process = jest.fn().mockRejectedValue(new Error('Agent error'));
      router.register(errorAgent, 5);

      const result = await router.route('error message');
      expect(result).toBeNull();
    });
  });

  describe('Agent Management', () => {
    beforeEach(() => {
      const agent = new BaseAgent({ name: 'TestAgent', priority: 5, keywords: ['test'] });
      router.register(agent, 5);
    });

    it('should toggle agent enabled state', () => {
      router.toggleAgent('TestAgent', false);
      expect(router.agents[0].agent.enabled).toBe(false);

      router.toggleAgent('TestAgent', true);
      expect(router.agents[0].agent.enabled).toBe(true);
    });

    it('should return false when toggling non-existent agent', () => {
      const result = router.toggleAgent('NonExistent', true);
      expect(result).toBe(false);
    });

    it('should change agent priority', () => {
      router.setPriority('TestAgent', 10);
      expect(router.agents[0].priority).toBe(10);
    });

    it('should re-sort agents after priority change', () => {
      const agent2 = new BaseAgent({ name: 'Agent2', priority: 1, keywords: ['a'] });
      router.register(agent2, 1);

      router.setPriority('Agent2', 20);

      expect(router.agents[0].agent.name).toBe('Agent2');
      expect(router.agents[0].priority).toBe(20);
    });

    it('should return false when setting priority of non-existent agent', () => {
      const result = router.setPriority('NonExistent', 10);
      expect(result).toBe(false);
    });
  });

  describe('Agent Information', () => {
    beforeEach(() => {
      const agent = new BaseAgent({
        name: 'InfoAgent',
        priority: 5,
        keywords: ['test', 'info']
      });
      router.register(agent, 5);
    });

    it('should return agent information', () => {
      const info = router.getAgentsInfo();
      expect(info.length).toBe(1);
      expect(info[0].name).toBe('InfoAgent');
      expect(info[0].priority).toBe(5);
      expect(info[0].enabled).toBe(true);
      expect(Array.isArray(info[0].keywords)).toBe(true);
    });

    it('should show context length in agent info', () => {
      const info = router.getAgentsInfo();
      expect(typeof info[0].contextLength).toBe('number');
    });
  });

  describe('Debug Output', () => {
    it('should not throw on debug call', () => {
      const agent = new BaseAgent({ name: 'TestAgent', priority: 5, keywords: ['test'] });
      router.register(agent, 5);

      expect(() => router.debug()).not.toThrow();
    });

    it('should handle empty agents list in debug', () => {
      const emptyRouter = new AgentRouter();
      expect(() => emptyRouter.debug()).not.toThrow();
    });
  });
});
