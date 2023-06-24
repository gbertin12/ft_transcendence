import { Module, forwardRef } from '@nestjs/common';
import { PunishmentsService } from './punishments.service';
import { PunishmentsController } from './punishments.controller';
import { DbService } from '../db/db.service';
import { ChatModule } from '../chat/chat.module';
import { ChannelModule } from '../channel/channel.module';

@Module({
  controllers: [PunishmentsController],
  providers: [PunishmentsService, DbService],
  imports: [forwardRef(() => ChatModule), forwardRef(() => ChannelModule)],
  exports: [PunishmentsService]
})
export class PunishmentsModule {}
