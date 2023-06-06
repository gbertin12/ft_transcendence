import { Module, forwardRef } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { ChatModule } from '../chat/chat.module';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService],
  imports: [FriendsModule, forwardRef(() => ChatModule)],
  exports: [FriendsService],
})
export class FriendsModule {}
