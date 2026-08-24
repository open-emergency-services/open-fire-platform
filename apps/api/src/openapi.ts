import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * OpenAPI contract (ADR-0001 #2). The API's shape is introspected from the live
 * route table — no hand-maintained spec to drift. Served two ways:
 *   GET /api/v1/openapi.json — the machine-readable contract (codegen, contract tests)
 *   GET /api/v1/docs         — interactive docs (assets bundled locally, works offline
 *                              in the field — no CDN)
 *
 * Called after setGlobalPrefix; the generated paths already carry the `/api/v1`
 * prefix, so no server entry is added (that would double it).
 */
export function setupOpenApi(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Open Fire Platform API')
    .setDescription(
      'Free, department-owned, event-sourced fire/EMS records. Append-only Core log + ' +
        'derived read models (ADR-0004), capture-everything ingestion (ADR-0006), and a ' +
        'swappable auth seam (ADR-0010). This contract is generated from the live routes.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: 'api/v1/openapi.json',
    customSiteTitle: 'Open Fire Platform API',
  });
}
