import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Dev: allow the local web app. Restrict to an allowlist before production.
  app.enableCors();

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 5040;
  await app.listen(port);
}

void bootstrap();
