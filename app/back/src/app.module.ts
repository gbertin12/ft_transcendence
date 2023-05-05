import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel.module';
import { ChatGateway } from "./gateway/chat.gateway";
import { UserModule } from './user/user.module';

@Module({
    imports: [AuthModule, DbModule, ChannelModule, ChatGateway, UserModule],
})
export class AppModule {}