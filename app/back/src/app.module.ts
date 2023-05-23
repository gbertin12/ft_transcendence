import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { ChannelModule } from './channel/channel.module';
import { UserModule } from './user/user.module';
import { FriendsModule } from './friends/friends.module';
import { PongModule } from './pong/pong.module';

@Module({
    imports: [AuthModule, DbModule, ChannelModule, UserModule, PongModule, FriendsModule],
})

export class AppModule {}
