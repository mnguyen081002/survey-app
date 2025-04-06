import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { v4 } from "uuid";
import { ApiResponseDto } from "../dto/api-response.dto";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { originalUrl, method, ip, body, startTime } = request;

    const userAgent = request.get("user-agent") || "";
    const requestId = request.headers["x-request-id"] || v4();
    const duration = Date.now() - (startTime || Date.now());

    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Đã xảy ra lỗi trên máy chủ";
    let errors = null;

    if (exception instanceof HttpException) {
      
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (typeof exceptionResponse === "string") {
        
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        
        message =
          exceptionResponse.message ||
          exceptionResponse.error ||
          "Lỗi xác thực";

        
        if (Array.isArray(exceptionResponse.message)) {
          errors = exceptionResponse.message;
          message = "Dữ liệu không hợp lệ";
        } else if (exceptionResponse.errors) {
          errors = exceptionResponse.errors;
        }
      }

      
      if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
        message = "Đã xảy ra lỗi trên máy chủ";
        errors = null; 
      }
    } else if (exception instanceof Error) {
      
      message = "Đã xảy ra lỗi trên máy chủ";

      
      this.logger.error(
        `${exception.name}: ${exception.message}`,
        exception.stack
      );
    }

    
    this.logger.error(
      `Request: ${requestId} ${method} ${originalUrl} ${JSON.stringify(body)} - Response: [${statusCode}] ${message} - ${userAgent} ${ip} - ${duration}ms`
    );

    
    const errorResponse: ApiResponseDto<null> = {
      message,
      data: null,
    };

    
    if (errors) {
      errorResponse.errors = errors;
    }

    response.status(statusCode).json(errorResponse);
  }
}
