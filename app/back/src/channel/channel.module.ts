import { Module, forwardRef } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { ChatModule } from '../chat/chat.module';
import { PunishmentsModule } from '../punishments/punishments.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
  imports: [forwardRef(() => ChatModule), PunishmentsModule, UserModule, AuthModule, DbModule],
  exports: [ChannelService],
})
export class ChannelModule {}
