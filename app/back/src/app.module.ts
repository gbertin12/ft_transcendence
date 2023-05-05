import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel.module';
import { ChatGateway } from "./gateway/chat.gateway";
import { UserModule } from './user/user.module';
import { PongGateway } from './gateway/pong/pong.gateway';

@Module({
    imports: [AuthModule, DbModule, ChannelModule, ChatGateway, UserModule, PongGateway],
})
export class AppModule {}