import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import ChatGateway from '../gateway/chat.gateway';
import { UserService } from '../user/user.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, UserService, ChatGateway],
  imports: [ChannelModule]
})
export class ChannelModule {}
