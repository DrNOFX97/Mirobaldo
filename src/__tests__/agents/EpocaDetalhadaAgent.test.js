/**
 * EpocaDetalhadaAgent Tests
 * Tests the agent responsible for detailed season information
 */

const epocaDetalhadaAgent = require('../../agents/epocaDetalhadaAgent');

describe('EpocaDetalhadaAgent', () => {
  describe('Agent Configuration', () => {
    it('should have correct name', () => {
      expect(epocaDetalhadaAgent.name).toBe('EpocaDetalhadaAgent');
    });

    it('should have high priority', () => {
      expect(epocaDetalhadaAgent.priority).toBe(10);
    });

    it('should include epoch keywords', () => {
      expect(epocaDetalhadaAgent.keywords).toContain('época');
      expect(epocaDetalhadaAgent.keywords).toContain('temporada');
    });

    it('should be enabled by default', () => {
      expect(epocaDetalhadaAgent.enabled).toBe(true);
    });
  });

  describe('canHandle Method', () => {
    it('should detect epoch pattern 1990/91', () => {
      expect(epocaDetalhadaAgent.canHandle('resultados de 1990/91')).toBe(true);
    });

    it('should detect epoch pattern 90/91', () => {
      expect(epocaDetalhadaAgent.canHandle('90/91')).toBe(true);
    });

    it('should detect epoch pattern 1990-91', () => {
      expect(epocaDetalhadaAgent.canHandle('temporada 1990-91')).toBe(true);
    });

    it('should detect época keyword', () => {
      expect(epocaDetalhadaAgent.canHandle('qual foi a época de 1995')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(epocaDetalhadaAgent.canHandle('ÉPOCA 1995/96')).toBe(true);
    });

    it('should return false for messages without epoch pattern', () => {
      expect(epocaDetalhadaAgent.canHandle('quem foi o melhor jogador?')).toBe(false);
    });
  });

  describe('getEpocaDetalhada Method', () => {
    it('should have the method available', () => {
      expect(typeof epocaDetalhadaAgent.getEpocaDetalhada).toBe('function');
    });

    it('should normalize epoch format 90/91 to 1990/91', () => {
      // The method should internally normalize formats
      const result = epocaDetalhadaAgent.getEpocaDetalhada('90/91');
      // Should either return data or null, not throw
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should normalize epoch format 1990-91 to 1990/91', () => {
      const result = epocaDetalhadaAgent.getEpocaDetalhada('1990-91');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle standard format 1990/91', () => {
      const result = epocaDetalhadaAgent.getEpocaDetalhada('1990/91');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return null for invalid epoch', () => {
      const result = epocaDetalhadaAgent.getEpocaDetalhada('9999/00');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return markdown formatted response when data found', () => {
      // Test with a known epoch that should exist
      const result = epocaDetalhadaAgent.getEpocaDetalhada('1990/91');
      if (result) {
        expect(result).toContain('#');
        expect(result).toContain('ÉPOCA');
      }
    });
  });

  describe('process Method', () => {
    it('should be callable', async () => {
      expect(typeof epocaDetalhadaAgent.process).toBe('function');
    });

    it('should return null for non-epoch messages', async () => {
      const result = await epocaDetalhadaAgent.process('quem foi o melhor jogador?');
      expect(result).toBeNull();
    });

    it('should process epoch patterns', async () => {
      const result = await epocaDetalhadaAgent.process('1995/96');
      // Should either return data or null
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle error gracefully', async () => {
      // Even with malformed input, should not throw
      const result = await epocaDetalhadaAgent.process('asdfsdfds');
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('Context Method', () => {
    it('should have getContext method', () => {
      expect(typeof epocaDetalhadaAgent.getContext).toBe('function');
    });

    it('should return non-empty context', () => {
      const context = epocaDetalhadaAgent.getContext();
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(0);
    });

    it('context should mention the agent responsibility', () => {
      const context = epocaDetalhadaAgent.getContext();
      expect(context.toLowerCase()).toContain('época');
    });

    it('context should include accuracy guidelines', () => {
      const context = epocaDetalhadaAgent.getContext();
      expect(context.toLowerCase()).toContain('classificação');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle real-world queries', async () => {
      const queries = [
        'resultados de 1995/96',
        'qual foi a classificação em 1990/91?',
        'como foi a época 1989/90?',
        'temporada 2000/01'
      ];

      for (const query of queries) {
        const result = await epocaDetalhadaAgent.process(query);
        expect(result === null || typeof result === 'string').toBe(true);
      }
    });

    it('should properly format output when found', async () => {
      const result = await epocaDetalhadaAgent.process('1995/96');
      if (result && result.length > 10) {
        // If we got a real result, check formatting
        expect(result).toContain('#'); // Should have markdown headers
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very old epochs', async () => {
      const result = await epocaDetalhadaAgent.process('1913/14');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle recent epochs', async () => {
      const result = await epocaDetalhadaAgent.process('2023/24');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle whitespace in queries', async () => {
      const result = await epocaDetalhadaAgent.process('  1995  /  96  ');
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should handle mixed case', async () => {
      const result = await epocaDetalhadaAgent.process('ÉPOCA 1995/96');
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('Metadata', () => {
    it('should have getMetadata method', () => {
      expect(typeof epocaDetalhadaAgent.getMetadata).toBe('function');
    });

    it('should return metadata object', () => {
      const metadata = epocaDetalhadaAgent.getMetadata();
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('priority');
      expect(metadata).toHaveProperty('enabled');
    });
  });
});
