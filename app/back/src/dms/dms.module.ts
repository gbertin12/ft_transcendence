import { Module, forwardRef } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';
import { UserModule } from '../user/user.module';
import { DbService } from '../db/db.service';
import { FriendsModule } from '../friends/friends.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  controllers: [DmsController],
  providers: [DmsService, DbService],
  exports: [DmsService],
  imports: [UserModule, FriendsModule, forwardRef(() => ChatModule)],
})
export class DmsModule {}
