import { Module } from '@nestjs/common';
import { PunishmentsService } from './punishments.service';
import { PunishmentsController } from './punishments.controller';
import { DbService } from 'db/db.service';

@Module({
  controllers: [PunishmentsController],
  providers: [PunishmentsService],
  imports: [DbService],
  exports: [PunishmentsService]
})
export class PunishmentsModule {}
