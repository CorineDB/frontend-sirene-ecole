// src/utils/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    console.error(...args)
    // TODO: Optionally send errors to a monitoring service in production
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args)
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info(...args)
    }
  },
};
