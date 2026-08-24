import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from './config';
import { setupOpenApi } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  setupOpenApi(app); // OpenAPI contract at /api/v1/openapi.json + docs at /api/v1/docs (ADR-0001)
  app.enableShutdownHooks(); // fire readiness drain (ADR-0004 LB contract) on SIGTERM
  const { port } = getConfig();
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`OFP API listening on http://localhost:${port}/api/v1`);
}
bootstrap();
