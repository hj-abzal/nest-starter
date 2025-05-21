import chalk from 'chalk';

export class HttpLogUtils {
  static getStatusColor(statusCode: number): string {
    if (statusCode >= 500) return chalk.red(statusCode.toString());
    if (statusCode >= 400) return chalk.yellow(statusCode.toString());
    if (statusCode >= 300) return chalk.cyan(statusCode.toString());
    if (statusCode >= 200) return chalk.green(statusCode.toString());
    return chalk.gray(statusCode.toString());
  }

  static getMethodColor(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return chalk.blue(method);
      case 'POST':
        return chalk.green(method);
      case 'PUT':
        return chalk.yellow(method);
      case 'DELETE':
        return chalk.red(method);
      case 'PATCH':
        return chalk.magenta(method);
      default:
        return chalk.gray(method);
    }
  }

  static formatResponseTime(startTime: number): string {
    const responseTime = Date.now() - startTime;
    if (responseTime < 100) return chalk.green(`${responseTime}ms`);
    if (responseTime < 500) return chalk.yellow(`${responseTime}ms`);
    return chalk.red(`${responseTime}ms`);
  }

  static formatContentLength(contentLength: string | undefined): string {
    if (!contentLength) return chalk.gray('0b');
    const size = parseInt(contentLength, 10);
    if (size < 1024) return chalk.gray(`${size}b`);
    if (size < 1024 * 1024) return chalk.gray(`${(size / 1024).toFixed(1)}kb`);
    return chalk.gray(`${(size / (1024 * 1024)).toFixed(1)}mb`);
  }

  static generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  static shouldLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    currentLogLevel: string,
  ): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(currentLogLevel);
  }

  static sanitizeSensitiveData(data: any): any {
    if (!data) return data;

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'key',
    ];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sanitized = { ...data };

    Object.keys(sanitized).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        sanitized[key] = '[REDACTED]';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (typeof sanitized[key] === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        sanitized[key] = this.sanitizeSensitiveData(sanitized[key]);
      }
    });

    return sanitized;
  }

  static formatRequestLog(
    requestId: string,
    method: string,
    url: string,
    ip: string,
    userAgent: string,
  ): string {
    return [
      chalk.gray(`[${requestId}]`),
      this.getMethodColor(method),
      chalk.white(url),
      chalk.gray('|'),
      chalk.gray(ip),
      chalk.gray('|'),
      chalk.gray(userAgent),
    ].join(' ');
  }

  static formatResponseLog(
    requestId: string,
    method: string,
    statusCode: number,
    url: string,
    contentLength: string | undefined,
    startTime: number,
    ip: string,
  ): string {
    return [
      chalk.gray(`[${requestId}]`),
      this.getMethodColor(method),
      this.getStatusColor(statusCode),
      chalk.white(url),
      this.formatContentLength(contentLength),
      this.formatResponseTime(startTime),
      chalk.gray('|'),
      chalk.gray(ip),
    ].join(' ');
  }

  static formatPerformanceMetrics(startTime: number): any {
    return {
      responseTime: Date.now() - startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  static formatErrorLog(
    error: any,
    requestId: string,
    method: string,
    url: string,
  ): any {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      message: error?.message || `Request failed`,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      stack: error?.stack,
      requestId,
      method,
      url,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      statusCode: error?.statusCode,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      responseTime: error?.responseTime,
    };
  }
}
