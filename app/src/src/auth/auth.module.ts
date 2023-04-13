import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [ConfigModule]
})
export class AuthModule {}
