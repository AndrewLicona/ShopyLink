import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
        ? (exceptionResponse as Record<string, unknown>).message
        : typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? JSON.stringify(exceptionResponse)
          : String(
              exceptionResponse ||
                (exception instanceof Error
                  ? exception.message
                  : 'Internal server error'),
            );

    console.error(
      `[GlobalException] ${request.method} ${request.url} - Status: ${status} - Error:`,
      message,
    );
    if (Number(status) === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      console.error(
        'Stack Trace:',
        exception instanceof Error ? exception.stack : 'No stack trace',
      );
    }

    // Force CORS headers on Error Response (Safe fallback)
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Credentials', 'false');

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
