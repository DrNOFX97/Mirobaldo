/**
 * BaseAgent Unit Tests
 * Tests the abstract base class for all agents
 */

const BaseAgent = require('../../core/BaseAgent');

describe('BaseAgent', () => {
  describe('Constructor', () => {
    it('should create agent with required properties', () => {
      const config = {
        name: 'TestAgent',
        priority: 5,
        keywords: ['test', 'demo'],
        enabled: true
      };

      const agent = new BaseAgent(config);

      expect(agent.name).toBe('TestAgent');
      expect(agent.priority).toBe(5);
      expect(agent.keywords).toEqual(['test', 'demo']);
      expect(agent.enabled).toBe(true);
    });

    it('should enable agent by default', () => {
      const agent = new BaseAgent({
        name: 'DefaultAgent',
        priority: 5,
        keywords: []
      });

      expect(agent.enabled).toBe(true);
    });

    it('should throw error if name is missing', () => {
      expect(() => {
        new BaseAgent({ priority: 5, keywords: [] });
      }).toThrow();
    });

    it('should have default priority of 5', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        keywords: []
      });

      expect(agent.priority).toBe(5);
    });

    it('should have default keywords array', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5
      });

      expect(Array.isArray(agent.keywords)).toBe(true);
      expect(agent.keywords.length).toBe(0);
    });
  });

  describe('canHandle Method', () => {
    let agent;

    beforeEach(() => {
      agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['época', 'temporada', 'result']
      });
    });

    it('should return true if message contains agent keyword', () => {
      expect(agent.canHandle('qual foi a época de 1990?')).toBe(true);
      expect(agent.canHandle('resultados da temporada')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(agent.canHandle('ÉPOCA 1995')).toBe(true);
      expect(agent.canHandle('Temporada 2000')).toBe(true);
    });

    it('should return false if message does not contain keywords', () => {
      expect(agent.canHandle('xyz abc def')).toBe(false);
    });

    it('should return false if agent is disabled', () => {
      agent.enabled = false;
      expect(agent.canHandle('época 1990')).toBe(false);
    });

    it('should return false for empty message', () => {
      expect(agent.canHandle('')).toBe(false);
    });

    it('should return false if no keywords defined', () => {
      const noKeywordsAgent = new BaseAgent({
        name: 'NoKeywords',
        priority: 5,
        keywords: []
      });

      expect(noKeywordsAgent.canHandle('any message')).toBe(false);
    });
  });

  describe('process Method', () => {
    it('should throw NotImplementedError', async () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test']
      });

      await expect(agent.process('test message')).rejects.toThrow('process() must be implemented');
    });
  });

  describe('getContext Method', () => {
    it('should return empty string by default', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test']
      });

      expect(agent.getContext()).toBe('');
    });

    it('should support custom context', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test']
      });

      agent.getContext = () => 'Custom context';
      expect(agent.getContext()).toBe('Custom context');
    });
  });

  describe('Metadata Methods', () => {
    let agent;

    beforeEach(() => {
      agent = new BaseAgent({
        name: 'TestAgent',
        priority: 7,
        keywords: ['test', 'demo']
      });
    });

    it('should return agent metadata', () => {
      const metadata = agent.getMetadata();

      expect(metadata.name).toBe('TestAgent');
      expect(metadata.priority).toBe(7);
      expect(metadata.enabled).toBe(true);
      expect(Array.isArray(metadata.keywords)).toBe(true);
    });
  });

  describe('Logging', () => {
    it('should log without throwing', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test']
      });

      expect(() => {
        agent.log('Test message');
      }).not.toThrow();
    });

    it('should log with level', () => {
      const agent = new BaseAgent({
        name: 'TestAgent',
        priority: 5,
        keywords: ['test']
      });

      expect(() => {
        agent.log('Test message', 'info');
        agent.log('Error message', 'error');
        agent.log('Warning message', 'warn');
      }).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should work with multiple keywords', () => {
      const agent = new BaseAgent({
        name: 'MultiKeywordAgent',
        priority: 5,
        keywords: ['época', 'temporada', 'season', 'resultado', 'result', 'jogo', 'game']
      });

      expect(agent.canHandle('época 1990')).toBe(true);
      expect(agent.canHandle('game result')).toBe(true);
      expect(agent.canHandle('jogo de temporada')).toBe(true);
      expect(agent.canHandle('something else')).toBe(false);
    });

    it('should maintain state across operations', () => {
      const agent = new BaseAgent({
        name: 'StateAgent',
        priority: 5,
        keywords: ['test']
      });

      expect(agent.canHandle('test')).toBe(true);

      agent.enabled = false;
      expect(agent.canHandle('test')).toBe(false);

      agent.enabled = true;
      expect(agent.canHandle('test')).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate agent configuration', () => {
      const config = {
        name: 'ValidAgent',
        priority: 5,
        keywords: ['test']
      };

      const agent = new BaseAgent(config);
      const validation = agent.validate();

      expect(validation).toEqual({
        valid: true,
        errors: []
      });
    });

    it('should handle edge case with special characters in keywords', () => {
      const agent = new BaseAgent({
        name: 'SpecialAgent',
        priority: 5,
        keywords: ['@test', '#demo', '$special']
      });

      expect(agent.keywords).toContain('@test');
      expect(agent.canHandle('message with @test keyword')).toBe(true);
    });
  });
});
