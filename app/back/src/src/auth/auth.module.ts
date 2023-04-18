import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DbModule } from 'src/db/db.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuth2Strategy } from './oauth2.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, OAuth2Strategy, JwtStrategy],
    imports: [
        DbModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SIGN_KEY,
            signOptions: { expiresIn: '7d' },
        }),
    ]
})
export class AuthModule {}
