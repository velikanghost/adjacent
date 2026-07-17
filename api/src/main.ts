import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('adjacent API')
    .setDescription(
      'Monad DeFi copilot — position discovery, pricing, and risk.',
    )
    .setVersion('0.1.0')
    .addTag('positions', 'Discover and value DeFi positions for an address')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 5040;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const baseUrl = `http://localhost:${port}`;
  logger.log(`adjacent API running at ${baseUrl}`);
  logger.log(`Swagger docs at ${baseUrl}/docs`);
}

void bootstrap();
