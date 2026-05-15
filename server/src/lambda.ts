import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import type { Express } from 'express';

const expressApp = express();
let cachedApp: Express | null = null;

export async function createApp(): Promise<Express> {
  if (cachedApp) return cachedApp;

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });

  nestApp.setGlobalPrefix('api');

  const allowedOrigins = [
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  nestApp.enableCors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o!))) cb(null, true);
      else cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  nestApp.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  nestApp.useGlobalFilters(new HttpExceptionFilter());
  nestApp.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  await nestApp.init();
  cachedApp = expressApp;
  return cachedApp;
}
