import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel.module';
import { ChatGateway } from "./gateway/chat.gateway";
import { UserModule } from './user/user.module';
import { PongModule } from './gateway/pong/pong.module';

@Module({
    imports: [AuthModule, DbModule, ChannelModule, ChatGateway, UserModule, PongModule],
})
export class AppModule {}
