import { Module } from '@nestjs/common';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
  imports: [ChannelModule]
})
export class ChannelModule {}
