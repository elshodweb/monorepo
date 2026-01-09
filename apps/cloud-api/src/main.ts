import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Cloud API')
    .setDescription('Central cloud backend for restaurant management and authentication')
    .setVersion('1.0')
    .addTag('restaurants', 'Restaurant management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('Cloud API is running on http://localhost:3000');
  console.log('Swagger documentation available at http://localhost:3000/api/docs');
}
bootstrap();
