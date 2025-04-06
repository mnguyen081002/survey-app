import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs/operators";
import { v4 } from "uuid";
@Injectable()
export class HTTPLogger implements NestInterceptor {
  private logger: Logger = new Logger(HTTPLogger.name);
  intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    request.startTime = start;
    const { originalUrl, method, ip } = request;

    const userAgent = request.get("user-agent") || "";

    const requestId = request.headers["x-request-id"] || v4();
    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - start;

        this.logger.log(
          `Request: ${requestId} ${method} ${originalUrl} ${JSON.stringify(request.body)} - Response: ${JSON.stringify(
            response,
          )} - ${userAgent} ${ip} - ${duration}ms`,
        );
      })
    );
  }
}
