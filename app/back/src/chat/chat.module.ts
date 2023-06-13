import { Module } from '@nestjs/common';
import { UserModule } from '../../src/user/user.module';
import { ChatGateway } from './chat.gateway';
import { FriendsModule } from '../friends/friends.module';
import { ChannelModule } from '../channel/channel.module';
import { PunishmentsModule } from '../punishments/punishments.module';
import { DmsModule } from '../dms/dms.module';

@Module({
    providers: [ChatGateway],
    imports: [UserModule, FriendsModule, ChannelModule, PunishmentsModule, DmsModule],
    exports: [ChatGateway],
})
export class ChatModule {}
