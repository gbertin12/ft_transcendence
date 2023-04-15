import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { authConstants } from './auth/constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser(authConstants.secret));
    await app.listen(3000);
}
bootstrap();
