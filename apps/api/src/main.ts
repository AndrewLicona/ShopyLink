import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { assertEncryptionKeyConfigured } from './core/common/encryption.util';

async function bootstrap() {
  // Fail fast: without this key the API cannot read the encrypted columns.
  assertEncryptionKeyConfigured();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  console.log('Enabling permissive CORS for debugging...');
  app.enableCors({
    origin: '*',
    credentials: false, // Must be false if origin is *
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
