import { Module, forwardRef } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { ChatModule } from '../chat/chat.module';
import { PunishmentsModule } from '../punishments/punishments.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
  imports: [forwardRef(() => ChatModule), PunishmentsModule, UserModule],
  exports: [ChannelService],
})
export class ChannelModule {}
