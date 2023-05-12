import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, UserService],
  imports: [FriendsModule]
})
export class FriendsModule {}
