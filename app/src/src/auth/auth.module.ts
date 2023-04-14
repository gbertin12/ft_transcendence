import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthStrategy } from './oauth.strategy';
import { Buffer } from 'buffer';
import { getRandomValues } from 'crypto';

const secret = Buffer.alloc(42);
getRandomValues(secret);

@Module({
    controllers: [AuthController],
    providers: [AuthService, OAuthStrategy],
    imports: [
        ConfigModule,
        JwtModule.register({
            global: true,
            secret,
        }),
    ]
})
export class AuthModule {}
