import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpLogUtils } from '../utils/http-logger.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logLevel: string = 'info';
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';
  }

  private logRequestBody(req: Request): void {
    if (
      this.isDevelopment &&
      HttpLogUtils.shouldLog('debug', this.logLevel) &&
      req.body
    ) {
      this.logger.debug(
        'Request Body:',
        HttpLogUtils.sanitizeSensitiveData(req.body),
      );
    }
  }

  private logQueryParams(req: Request): void {
    if (
      HttpLogUtils.shouldLog('debug', this.logLevel) &&
      Object.keys(req.query).length > 0
    ) {
      this.logger.debug(
        'Query Params:',
        HttpLogUtils.sanitizeSensitiveData(req.query),
      );
    }
  }

  private logHeaders(req: Request): void {
    if (this.isDevelopment && HttpLogUtils.shouldLog('debug', this.logLevel)) {
      const headers = { ...req.headers };
      delete headers.authorization;
      delete headers.cookie;

      this.logger.debug(
        'Headers:',
        HttpLogUtils.sanitizeSensitiveData(headers),
      );
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = HttpLogUtils.generateRequestId();
    req['requestId'] = requestId;

    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || 'unknown ip';

    if (HttpLogUtils.shouldLog('info', this.logLevel)) {
      this.logger.log(
        HttpLogUtils.formatRequestLog(
          requestId,
          method,
          originalUrl,
          ip || '',
          userAgent,
        ),
      );
    }

    if (this.isDevelopment) {
      this.logRequestBody(req);
      this.logQueryParams(req);
      this.logHeaders(req);
    }

    const originalSend = res.send;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    res.send = function (body: any) {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (HttpLogUtils.shouldLog('info', this.logLevel)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.logger.log(
          HttpLogUtils.formatResponseLog(
            requestId,
            method,
            statusCode,
            originalUrl,
            contentLength,
            startTime,
            ip,
          ),
        );
      }

      // Log performance metrics
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (HttpLogUtils.shouldLog('debug', this.logLevel)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.logger.debug(
          'Performance:',
          HttpLogUtils.formatPerformanceMetrics(startTime),
        );
      }

      // Log error if status code is 4xx or 5xx
      if (statusCode >= 400) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        this.logger.error(
          HttpLogUtils.formatErrorLog(
            {
              statusCode,
              responseTime: Date.now() - startTime,
            },
            requestId,
            method,
            originalUrl,
          ),
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return originalSend.call(this, body);
    }.bind(this);

    res.on('error', (error) => {
      this.logger.error(
        HttpLogUtils.formatErrorLog(error, requestId, method, originalUrl),
      );
    });

    next();
  }
}
