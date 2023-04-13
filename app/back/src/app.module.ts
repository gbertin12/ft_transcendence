import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel.module';

@Module({
    imports: [AuthModule, DbModule, ChannelModule],
})
export class AppModule {}
