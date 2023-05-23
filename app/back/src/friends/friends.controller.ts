import { Controller, Get, UseGuards, Req, Post, Body, Delete, Param, ForbiddenException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { Friend, FriendRequest, User } from '@prisma/client';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import ChatGateway from '../gateway/chat.gateway';

class FriendRequestDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  to: number;
}

class FriendReqIdDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  id: number;
}

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly userService: UserService,
    private chatGateway: ChatGateway,
    )
    { }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/')
  async getUserFriends(@Req() req) {
    return this.friendsService.getUserFriends(req.user['id']);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Get('/requests')
  async getUserFriendRequests(@Req() req) {
    return this.friendsService.getUserFriendRequests(req.user['id']);
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('/add')
  async addFriend(@Req() req, @Body() body: FriendRequestDto) {
    let sender: User = req.user;
    let receiver_id: number = body.to;
    if (sender.id == receiver_id) {
      throw new ForbiddenException("You can't add yourself as a friend");
    }
    let senderFriends: Friend[] = await this.friendsService.getUserFriends(sender.id);
    for (let friend of senderFriends) {
      if (friend.user_id == receiver_id) {
        throw new ForbiddenException("You're already friends with this user");
      }
    }
    let friendRequest: any = await this.friendsService.addFriend(sender, receiver_id);
    friendRequest.sender = sender;
    this.chatGateway.server.emit("friendRequestAdded", friendRequest);
    return friendRequest;
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Post('/requests/:id/accept')
  async acceptFriendRequest(@Req() req, @Param() params: FriendReqIdDto) {
    let receiver_id: number = req.user['id'];
    const newFriend: Friend = await this.friendsService.acceptFriendRequest(receiver_id, params.id);
    const removedRequest: FriendRequest = await this.friendsService.deleteFriendRequest(receiver_id, params.id);
    this.chatGateway.server.emit("friendRequestAccepted", newFriend);
    this.chatGateway.server.emit("friendRequestDeleted", removedRequest.request_id);
    return newFriend;
  }

  @UseGuards(AuthGuard('jwt-2fa'))
  @Delete('/requests/:id')
  async deleteFriendRequest(@Req() req, @Param() params: FriendReqIdDto) {
    let receiver_id: number = req.user['id'];
    const deletedRequest: FriendRequest = await this.friendsService.deleteFriendRequest(receiver_id, params.id);
    this.chatGateway.server.emit("friendRequestDeleted", deletedRequest.request_id);
    return deletedRequest;
  }
}