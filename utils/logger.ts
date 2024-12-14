// utils/logger.ts
// Utility functions for logging messages to the console and external services

// utils/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

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

    // Log to external service only in production
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      logError({ error: new Error(message), errorInfo: meta });
    }
  },
  info: (message: string, meta?: any) => logger.log('info', message, meta),
  warn: (message: string, meta?: any) => logger.log('warn', message, meta),
  error: (message: string, meta?: any) => logger.log('error', message, meta),
};

export const logError = async ({ error, errorInfo }: { error: Error; errorInfo: any }) => {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}/api/logError`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo?.componentStack || null,
          meta: errorInfo,
        },
      }),
    });

    if (!response.ok) {
      console.error('[ERROR] Failed to log error to server:', response.statusText);
    }
  } catch (loggingError) {
    console.error('[ERROR] Error logging to external service:', loggingError);
  }
};