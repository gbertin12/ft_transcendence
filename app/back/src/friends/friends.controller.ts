import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly userService: UserService,
    )
    { }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/')
  async getUserFriends(@Req() req) {
    const user = await this.userService.getUserById(req.user['id']);
    return this.friendsService.getUserFriends(user.id);
  }
}