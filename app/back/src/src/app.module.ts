import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [AuthModule, DbModule, UserModule],
})
export class AppModule {}
