import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({ origin: process.env.FRONT_URL, credentials: true });
    app.use(cookieParser());
    app.useStaticAssets('/app/files');
    app.use(compression());
    await app.listen(3000);
}
bootstrap();
