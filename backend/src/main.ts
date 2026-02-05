import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? '').split(',').filter(Boolean),
    credentials: false,
  });

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = Number(process.env.PORT ?? 8081);
  await app.listen(port);

  console.log(`API on http://localhost:${port}/api`);
}
bootstrap();