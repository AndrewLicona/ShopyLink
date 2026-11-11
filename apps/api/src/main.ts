import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { assertEncryptionKeyConfigured } from './core/common/encryption.util';
import { assertJwtSecretConfigured } from './core/common/jwt-secret.util';

async function bootstrap() {
  // Fail fast: without this key the API cannot read the encrypted columns.
  assertEncryptionKeyConfigured();
  // La suplantacion queda deshabilitada si no hay secreto de firma.
  assertJwtSecretConfigured();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  // nginx es el unico proxy delante de la API: con un salto confiable el
  // throttle ve la IP real del visitante en vez de la del contenedor.
  app.set('trust proxy', 1);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const allowedOrigins = (
    process.env.FRONTEND_URL ||
    'https://shopylinks.shop,https://www.shopylinks.shop,http://localhost:3000,http://localhost:8191'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-zA-Z0-9-]+\.shopylinks\.shop$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
