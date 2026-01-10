import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Local API')
    .setDescription('Restaurant local backend for tablet management')
    .setVersion('1.0')
    .addTag('setup', 'Local API setup and activation')
    .addTag('tablets', 'Tablet management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // ✅ Добавьте настройки для статических файлов
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(3001);
  console.log('Local API is running on http://localhost:3001');
  console.log('Swagger documentation available at http://localhost:3001/docs');
}
bootstrap();