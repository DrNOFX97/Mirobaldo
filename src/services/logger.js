/**
 * Centralized Logging Service
 * Standardizes error handling and logging across the application
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error
    this.environment = process.env.NODE_ENV || 'development';
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.enableFileLogging = options.enableFileLogging !== false;
    this.enableConsoleLogging = options.enableConsoleLogging !== false;
    this.maxLogFiles = options.maxLogFiles || 7; // Keep 7 days of logs
    this.maxLogSize = options.maxLogSize || 10 * 1024 * 1024; // 10MB

    // Create logs directory if it doesn't exist
    this.ensureLogDir();

    // Log levels with priorities
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    this.currentLogFile = null;
    this.currentLogSize = 0;
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogDir() {
    if (this.enableFileLogging && !fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create logs directory:', error);
      }
    }
  }

  /**
   * Get log file path for current date
   */
  getLogFilePath() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  /**
   * Format log message
   */
  formatMessage(level, source, message, data = null) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${source}]${dataStr} ${message}\n`;
  }

  /**
   * Write to log file
   */
  writeToFile(formattedMessage) {
    if (!this.enableFileLogging) return;

    try {
      const logFile = this.getLogFilePath();

      // Check if we need to rotate log file
      if (logFile !== this.currentLogFile) {
        this.currentLogFile = logFile;
        this.currentLogSize = fs.existsSync(logFile) ? fs.statSync(logFile).size : 0;
      }

      // If log file exceeds max size, add timestamp suffix
      if (this.currentLogSize > this.maxLogSize) {
        const timestamp = Date.now();
        const archiveFile = logFile.replace('.log', `.${timestamp}.log`);
        fs.renameSync(logFile, archiveFile);
        this.currentLogSize = 0;
        this.cleanOldLogs();
      }

      fs.appendFileSync(logFile, formattedMessage);
      this.currentLogSize += formattedMessage.length;
    } catch (error) {
      console.error('Error writing to log file:', error.message);
    }
  }

  /**
   * Clean old log files
   */
  cleanOldLogs() {
    if (!this.enableFileLogging) return;

    try {
      const files = fs.readdirSync(this.logDir)
        .filter(f => f.endsWith('.log'))
        .map(f => ({
          name: f,
          time: fs.statSync(path.join(this.logDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      // Remove files older than maxLogFiles
      files.slice(this.maxLogFiles).forEach(f => {
        try {
          fs.unlinkSync(path.join(this.logDir, f.name));
        } catch (error) {
          console.error(`Failed to delete log file ${f.name}:`, error.message);
        }
      });
    } catch (error) {
      console.error('Error cleaning old logs:', error.message);
    }
  }

  /**
   * Write to console
   */
  writeToConsole(level, source, message, data = null) {
    if (!this.enableConsoleLogging) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${source}]`;

    switch (level.toLowerCase()) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'debug':
        if (process.env.DEBUG) {
          console.log(prefix, message, data || '');
        }
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }

  /**
   * Should log based on level
   */
  shouldLog(level) {
    return this.levels[level.toLowerCase()] >= this.levels[this.logLevel.toLowerCase()];
  }

  /**
   * Generic log function
   */
  log(level, source, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, source, message, data);
    this.writeToConsole(level, source, message, data);
    this.writeToFile(formattedMessage);
  }

  /**
   * Log debug message
   */
  debug(source, message, data = null) {
    this.log('debug', source, message, data);
  }

  /**
   * Log info message
   */
  info(source, message, data = null) {
    this.log('info', source, message, data);
  }

  /**
   * Log warning message
   */
  warn(source, message, data = null) {
    this.log('warn', source, message, data);
  }

  /**
   * Log error message
   */
  error(source, message, error = null) {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('error', source, message, errorData);
  }

  /**
   * Create child logger with bound source
   */
  createChild(source) {
    return new ChildLogger(this, source);
  }

  /**
   * Get logs for date range
   */
  getLogs(startDate, endDate) {
    if (!this.enableFileLogging) return [];

    const logs = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const logFile = path.join(this.logDir, `${dateStr}.log`);

      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        logs.push({ date: dateStr, content, size: content.length });
      }

      current.setDate(current.getDate() + 1);
    }

    return logs;
  }

  /**
   * Get current application status
   */
  getStatus() {
    return {
      logLevel: this.logLevel,
      environment: this.environment,
      fileLogging: this.enableFileLogging,
      consoleLogging: this.enableConsoleLogging,
      logDir: this.logDir,
      maxLogSize: `${this.maxLogSize / 1024 / 1024}MB`,
      maxLogFiles: this.maxLogFiles
    };
  }
}

/**
 * Child Logger - Logger bound to a specific source
 */
class ChildLogger {
  constructor(parentLogger, source) {
    this.parent = parentLogger;
    this.source = source;
  }

  debug(message, data = null) {
    this.parent.debug(this.source, message, data);
  }

  info(message, data = null) {
    this.parent.info(this.source, message, data);
  }

  warn(message, data = null) {
    this.parent.warn(this.source, message, data);
  }

  error(message, error = null) {
    this.parent.error(this.source, message, error);
  }
}

// Singleton instance
let instance = null;

module.exports = {
  /**
   * Get or create singleton logger
   */
  getInstance(options = {}) {
    if (!instance) {
      instance = new Logger(options);
    }
    return instance;
  },

  /**
   * Create new logger instance
   */
  createLogger(options = {}) {
    return new Logger(options);
  },

  // Direct class exports for testing
  Logger,
  ChildLogger
};
