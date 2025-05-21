import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ credentials: true, origin: '*' });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get<number>('PORT') || 8080;

  await app.listen(PORT, () => console.log('PORT:', PORT));
}

bootstrap();
