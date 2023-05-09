import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({ origin: process.env.FRONT_URL, credentials: true });
    app.use(cookieParser());
    app.useStaticAssets('/app/files');
    app.use(compression());

    app.useGlobalPipes(new ValidationPipe(
		{
			exceptionFactory: (validationErrors: ValidationError[] = []) => {
				return new BadRequestException(validationErrors);
			},
		}
	)); // Use class-validator

    await app.listen(3000);
}
bootstrap();
