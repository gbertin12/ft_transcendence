import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Jwt2faStrategy } from './strategies/jwt-2fa.strategy';
import { DiscordStrategy } from './strategies/discord.strategy'
import { GithubStrategy } from './strategies/github.strategy'
import { LocalStrategy } from './strategies/local.strategy'

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        Jwt2faStrategy,
        DiscordStrategy,
        GithubStrategy,
        LocalStrategy,
    ],
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
