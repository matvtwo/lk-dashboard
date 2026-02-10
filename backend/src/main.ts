import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [      'http://localhost:5175',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5173',
      'http://localhost:19080',
      'http://127.0.0.1:19080','http://155.212.161.21:19080'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 19421;
  await app.listen(port);
  console.log(`API on http://localhost:${port}/api`);
}

bootstrap();
