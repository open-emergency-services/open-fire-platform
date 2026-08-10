import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  const { port } = getConfig();
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`OFP API listening on http://localhost:${port}/api/v1`);
}
bootstrap();
