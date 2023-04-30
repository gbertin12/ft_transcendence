import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Jwt2faStrategy } from './jwt-2fa.strategy';
import { UserModule } from 'src/user/user.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, Jwt2faStrategy],
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SIGN_KEY,
            signOptions: { expiresIn: '7d' },
        }),
    ]
})
export class AuthModule {}
