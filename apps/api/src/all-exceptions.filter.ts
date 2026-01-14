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

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            message: (exception as Error).message,
            stack: (exception as Error).stack,
          };

    console.error('Global Exception Filter Caught:', message);

    // Force CORS headers on Error Response
    response.header('Access-Control-Allow-Origin', '*');
    response.header(
      'Access-Control-Allow-Methods',
      'GET,PUT,POST,DELETE,OPTIONS,PATCH',
    );
    response.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Accept, Authorization',
    );
    response.header('Access-Control-Allow-Credentials', 'false');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
