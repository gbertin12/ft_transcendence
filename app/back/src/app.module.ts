import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel/channel.module';
import { ChatGateway } from "./gateway/chat.gateway";

@Module({
    imports: [AuthModule, DbModule, ChannelModule, ChatGateway],
})
export class AppModule {}
