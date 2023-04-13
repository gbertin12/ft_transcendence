import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [AuthModule, DbModule, ConfigModule.forRoot()],
})
export class AppModule {}
