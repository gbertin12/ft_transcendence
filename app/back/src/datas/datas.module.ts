import { Module } from '@nestjs/common';
import { DatasService } from './datas.service';
import { DatasController } from './datas.controller';
import { ChannelModule } from '../channel/channel.module';
import { DbService } from '../db/db.service';

@Module({
  controllers: [DatasController],
  providers: [DatasService, DbService],
  imports: [ChannelModule],
  exports: [DatasService]
})
export class DatasModule {}
