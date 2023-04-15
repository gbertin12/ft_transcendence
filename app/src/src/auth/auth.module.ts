import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthStrategy } from './oauth.strategy';
import { authConstants } from './constants';

@Module({
    controllers: [AuthController],
    providers: [AuthService, OAuthStrategy],
    imports: [
        ConfigModule,
        JwtModule.register({
            global: true,
            secret: authConstants.secret,
        }),
    ]
})
export class AuthModule {}
