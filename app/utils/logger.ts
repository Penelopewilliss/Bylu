// Centralized logging service for development and production
// Automatically disabled in production builds for better performance

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    // __DEV__ is a React Native global that's true in development
    this.isDevelopment = __DEV__;
  }

  /**
   * Log info message (only in development)
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  /**
   * Log warning message (only in development)
   */
  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  /**
   * Log error message (always logged, even in production)
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error, ...args);
    } else {
      // In production, you might want to send errors to a service like Sentry
      // For now, we'll just log to console but this won't show in release builds
      console.error(message, error);
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`, ...args);
    }
  }

  /**
   * Log success message (only in development)
   */
  success(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  /**
   * Log with custom emoji (only in development)
   */
  custom(emoji: string, message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`${emoji} ${message}`, ...args);
    }
  }

  /**
   * Log Firebase operations (only in development)
   */
  firebase(operation: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🔥 Firebase ${operation}:`, ...args);
    }
  }

  /**
   * Log authentication operations (only in development)
   */
  auth(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🔐 Auth: ${message}`, ...args);
    }
  }

  /**
   * Log sync operations (only in development)
   */
  sync(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`☁️ Sync: ${message}`, ...args);
    }
  }

  /**
   * Log audio operations (only in development)
   */
  audio(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`🔊 Audio: ${message}`, ...args);
    }
  }

  /**
   * Group logs together (only in development)
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Time a function execution (only in development)
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export default new Logger();
