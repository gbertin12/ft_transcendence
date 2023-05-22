import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UserService } from '../user/user.service';
import ChatGateway from '../gateway/chat.gateway';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, UserService, ChatGateway],
  imports: [FriendsModule]
})
export class FriendsModule {}
