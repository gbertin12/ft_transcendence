import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthStrategy } from './oauth.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, OAuthStrategy],
    imports: [ConfigModule]
})
export class AuthModule {}
