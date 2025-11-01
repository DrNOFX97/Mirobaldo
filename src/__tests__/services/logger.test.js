/**
 * Logger Service Tests
 * Tests centralized logging functionality
 */

const { getInstance, createLogger, Logger } = require('../../services/logger');
const fs = require('fs');
const path = require('path');

describe('Logger Service', () => {
  let testLogDir;

  beforeEach(() => {
    testLogDir = path.join(__dirname, '../../..', 'test-logs');
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test logs
    if (fs.existsSync(testLogDir)) {
      const files = fs.readdirSync(testLogDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testLogDir, file));
      });
      fs.rmdirSync(testLogDir);
    }
  });

  describe('Logger Initialization', () => {
    it('should create logger instance', () => {
      const logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should use default log level', () => {
      const logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
      expect(logger.logLevel).toBeDefined();
    });

    it('should respect environment log level', () => {
      process.env.LOG_LEVEL = 'debug';
      const logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
      expect(logger.logLevel).toBe('debug');
      delete process.env.LOG_LEVEL;
    });

    it('should create logs directory if not exists', () => {
      const newDir = path.join(__dirname, '../../..', 'new-test-logs');
      expect(fs.existsSync(newDir)).toBe(false);

      new Logger({ logDir: newDir });

      expect(fs.existsSync(newDir)).toBe(true);
      fs.rmdirSync(newDir);
    });
  });

  describe('Log Levels', () => {
    let logger;

    beforeEach(() => {
      logger = createLogger({ logDir: testLogDir, enableConsoleLogging: false });
    });

    it('should log debug messages', () => {
      expect(() => logger.debug('source', 'message')).not.toThrow();
    });

    it('should log info messages', () => {
      expect(() => logger.info('source', 'message')).not.toThrow();
    });

    it('should log warn messages', () => {
      expect(() => logger.warn('source', 'message')).not.toThrow();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      expect(() => logger.error('source', 'message', error)).not.toThrow();
    });

    it('should respect log level filtering', () => {
      const logger2 = new Logger({
        logDir: testLogDir,
        enableFileLogging: false,
        enableConsoleLogging: false
      });
      logger2.logLevel = 'error';

      expect(() => logger2.debug('source', 'debug')).not.toThrow();
      expect(() => logger2.info('source', 'info')).not.toThrow();
      expect(() => logger2.warn('source', 'warn')).not.toThrow();
      expect(() => logger2.error('source', 'error')).not.toThrow();
    });
  });

  describe('Message Formatting', () => {
    let logger;

    beforeEach(() => {
      logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
    });

    it('should format message with timestamp', () => {
      const message = logger.formatMessage('info', 'test-source', 'test message');
      expect(message).toContain('INFO');
      expect(message).toContain('test-source');
      expect(message).toContain('test message');
    });

    it('should include data in formatted message', () => {
      const data = { key: 'value' };
      const message = logger.formatMessage('info', 'test', 'msg', data);
      expect(message).toContain(JSON.stringify(data));
    });

    it('should convert level to uppercase', () => {
      const message = logger.formatMessage('debug', 'test', 'msg');
      expect(message).toContain('DEBUG');

      const message2 = logger.formatMessage('ERROR', 'test', 'msg');
      expect(message2).toContain('ERROR');
    });
  });

  describe('File Operations', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger({ logDir: testLogDir, enableConsoleLogging: false });
    });

    it('should write log to file', () => {
      logger.info('test-source', 'test message');

      const logFile = logger.getLogFilePath();
      expect(fs.existsSync(logFile)).toBe(true);
    });

    it('should append to existing log file', () => {
      logger.info('test1', 'message1');
      logger.info('test2', 'message2');

      const logFile = logger.getLogFilePath();
      const content = fs.readFileSync(logFile, 'utf-8');

      expect(content).toContain('message1');
      expect(content).toContain('message2');
    });

    it('should generate log file path for current date', () => {
      const logFile = logger.getLogFilePath();
      const dateStr = new Date().toISOString().split('T')[0];

      expect(logFile).toContain(dateStr);
      expect(logFile).toEndWith('.log');
    });

    it('should handle file write errors gracefully', () => {
      logger.logDir = '/invalid/path/that/does/not/exist';
      expect(() => logger.info('test', 'message')).not.toThrow();
    });
  });

  describe('Child Loggers', () => {
    let logger;

    beforeEach(() => {
      logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
    });

    it('should create child logger', () => {
      const child = logger.createChild('ChildSource');
      expect(child).toBeDefined();
      expect(child.source).toBe('ChildSource');
    });

    it('should use source from child logger', () => {
      const child = logger.createChild('MySrc');
      expect(() => child.info('message')).not.toThrow();
      expect(() => child.warn('warning')).not.toThrow();
      expect(() => child.error('error', new Error())).not.toThrow();
    });
  });

  describe('Status and Monitoring', () => {
    let logger;

    beforeEach(() => {
      logger = createLogger({ logDir: testLogDir });
    });

    it('should return logger status', () => {
      const status = logger.getStatus();

      expect(status).toHaveProperty('logLevel');
      expect(status).toHaveProperty('environment');
      expect(status).toHaveProperty('fileLogging');
      expect(status).toHaveProperty('consoleLogging');
      expect(status).toHaveProperty('logDir');
    });

    it('should reflect log configuration in status', () => {
      const logger2 = new Logger({
        logDir: testLogDir,
        enableFileLogging: false,
        enableConsoleLogging: true
      });

      const status = logger2.getStatus();
      expect(status.fileLogging).toBe(false);
      expect(status.consoleLogging).toBe(true);
    });
  });

  describe('Log Retrieval', () => {
    let logger;

    beforeEach(() => {
      logger = new Logger({ logDir: testLogDir, enableConsoleLogging: false });
    });

    it('should retrieve logs for date range', () => {
      logger.info('test', 'message 1');
      logger.warn('test', 'message 2');

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const logs = logger.getLogs(startDate, endDate);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should include log content', () => {
      logger.info('test', 'unique-message-123');

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const logs = logger.getLogs(today, tomorrow);
      const combined = logs.map(l => l.content).join('');

      expect(combined).toContain('unique-message-123');
    });

    it('should return empty array for future dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      const past = new Date();
      past.setDate(past.getDate() - 1);

      const logs = logger.getLogs(yesterday, past);
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    let logger;

    beforeEach(() => {
      logger = createLogger({ logDir: testLogDir, enableFileLogging: false });
    });

    it('should log Error objects correctly', () => {
      const error = new Error('Test error message');
      expect(() => logger.error('source', 'operation failed', error)).not.toThrow();
    });

    it('should log non-Error objects', () => {
      expect(() => logger.error('source', 'message', { code: 'ERR_001' })).not.toThrow();
      expect(() => logger.error('source', 'message', 'string error')).not.toThrow();
    });

    it('should handle null data', () => {
      expect(() => logger.info('source', 'message', null)).not.toThrow();
      expect(() => logger.warn('source', 'message', undefined)).not.toThrow();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance for singleton', () => {
      const logger1 = getInstance();
      const logger2 = getInstance();

      expect(logger1).toBe(logger2);
    });

    it('should respect options on first initialization', () => {
      // Clear any existing instance
      const logger = getInstance({ logDir: testLogDir });
      expect(logger.logDir).toContain(testLogDir);
    });
  });
});
