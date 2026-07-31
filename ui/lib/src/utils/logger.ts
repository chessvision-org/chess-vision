const isDevelopment = process.env['NODE_ENV'] !== 'production';

export const logger = {
  log(...args: unknown[]): void {
    if (isDevelopment) console.log(...args);
  },

  warn(...args: unknown[]): void {
    if (isDevelopment) console.warn(...args);
  },

  error(...args: unknown[]): void {
    console.error(...args);
  }
};
