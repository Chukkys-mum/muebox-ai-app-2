// utils/logger.ts
// Utility functions for logging messages to the console and external services
type LogLevel = 'info' | 'warn' | 'error';

export const logger = {
  log: (level: LogLevel, message: string, meta?: any) => {
    const logMessage = `[${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, meta);
        break;
      case 'warn':
        console.warn(logMessage, meta);
        break;
      case 'error':
        console.error(logMessage, meta);
        break;
    }

    // Log to an external service
    if (level === 'error') {
      logError({ error: new Error(message), errorInfo: meta });
    }
  },
  info: (message: string, meta?: any) => logger.log('info', message, meta),
  warn: (message: string, meta?: any) => logger.log('warn', message, meta),
  error: (message: string, meta?: any) => logger.log('error', message, meta),
};

// Function to log errors to an external service
export const logError = async ({ error, errorInfo }: { error: Error; errorInfo: any }) => {
  try {
    const response = await fetch('/api/logError', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack || null,
        meta: errorInfo,
      }),
    });

    if (!response.ok) {
      console.error('[ERROR] Failed to log error to server:', response.statusText);
    }
  } catch (loggingError) {
    console.error('[ERROR] Error logging to external service:', loggingError);
  }
};
