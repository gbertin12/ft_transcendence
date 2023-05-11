import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import ChatGateway from '../gateway/chat.gateway';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, ChatGateway],
  imports: [ChannelModule]
})
export class ChannelModule {}
