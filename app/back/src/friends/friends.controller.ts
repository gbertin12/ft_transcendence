import { Controller, Get, UseGuards, Req, Post, Body, Delete, Param, ForbiddenException, Query, BadRequestException } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { Friend, FriendRequest, User } from '@prisma/client';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatGateway } from '../chat/chat.gateway';

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
    ) { }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('/')
    async getUserFriends(@Req() req, @Query('blocked') blocked: boolean = false) {
        if (blocked) {
            return this.friendsService.getUserRelationships(req.user);
        } else {
            return this.friendsService.getUserFriends(req.user);
        }
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
        let senderFriends: Friend[] = await this.friendsService.getUserFriends(sender);
        for (let friend of senderFriends) {
            if (friend.user_id == receiver_id) {
                throw new ForbiddenException("You're already friends with this user");
            }
        }
        // Check if there is already a friend request
        if (await this.friendsService.friendRequestExists(sender.id, receiver_id))
        {
            throw new ForbiddenException("You already sent a friend request to this user");
        }

        let friendRequest: any = await this.friendsService.addFriend(sender, receiver_id);
        friendRequest.sender = sender;
        // Send friendRequestAdded to receiver
        this.chatGateway.server.to(`user-${receiver_id}`).emit("friendRequestAdded", friendRequest);
        this.chatGateway.server.to(`user-${sender.id}`).emit("friendRequestAdded", friendRequest);
        return friendRequest;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('/requests/:id/accept')
    async acceptFriendRequest(@Req() req, @Param() params: FriendReqIdDto) {
        let receiver_id: number = req.user['id'];
        console.log("receiver_id", receiver_id)
        
        let request = await this.friendsService.getFriendRequest(params.id, receiver_id);

        if (!request) {
            throw new ForbiddenException("You can't accept a friend request that doesn't exist");
        }

        const newFriend: Friend = await this.friendsService.acceptFriendRequest(receiver_id, params.id);

        // Sender has to receive the new user, not the new friend (because the new friend is the sender)
        let receiver = await this.userService.getUserById(receiver_id);
        this.chatGateway.server.to(`user-${params.id}`).emit("friendRequestAccepted", {
            user: receiver
        });
        this.chatGateway.server.to(`user-${params.id}`).emit("friendRequestDeleted", request);
        this.chatGateway.server.to(`user-${receiver_id}`).emit("friendRequestDeleted", request);
        this.chatGateway.server.to(`user-${receiver_id}`).emit("friendRequestAccepted", newFriend);
        return newFriend;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete('/requests/:id')
    async deleteFriendRequest(@Req() req, @Param() params: FriendReqIdDto) {
        let receiver_id: number = req.user['id'];
        const deletedRequest: FriendRequest = await this.friendsService.deleteFriendRequest(receiver_id, params.id);
        // send friendRequestDeleted to receiver and sender
        this.chatGateway.server.to(`user-${receiver_id}`).emit("friendRequestDeleted", deletedRequest);
        this.chatGateway.server.to(`user-${deletedRequest.sender_id}`).emit("friendRequestDeleted", deletedRequest);
        return deletedRequest;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete('/requests/cancel/:id')
    async cancelFriendRequest(@Req() req, @Param() params: FriendReqIdDto) {
        let sender_id: number = req.user['id'];
        const deletedRequest: FriendRequest = await this.friendsService.deleteFriendRequest(params.id, sender_id);
        this.chatGateway.server.to(`user-${deletedRequest.receiver_id}`).emit("friendRequestDeleted", deletedRequest);
        this.chatGateway.server.to(`user-${sender_id}`).emit("friendRequestDeleted", deletedRequest);
        return deletedRequest;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete('/:id')
    async deleteFriend(@Req() req, @Param() params: FriendReqIdDto) {
        if (!await this.friendsService.deleteFriend(req.user['id'], params.id)) {
            throw new ForbiddenException("You can't delete a friend that doesn't exist");
        }
        this.chatGateway.server.to(`user-${req.user['id']}`).emit("deleteFriend", params.id);
        this.chatGateway.server.to(`user-${params.id}`).emit("deleteFriend", req.user['id']);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post("/block/:id")
    async blockUser(@Req() req, @Param () params: FriendReqIdDto) {
        if (req.user['id'] == params.id) {
            throw new BadRequestException("You can't block yourself");
        }
        try {
            await this.friendsService.blockUser(req.user['id'], params.id);
            this.chatGateway.server.to(`user-${req.user['id']}`).emit("deleteFriend", req.user['id']);
        } catch (e) {
            // TODO: throw an error maybe ?
        }
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post("/unblock/:id")
    async unblockUser(@Req() req, @Param () params: FriendReqIdDto) {
        if (req.user['id'] == params.id) {
            throw new BadRequestException("You can't unblock yourself");
        }
        try {
            await this.friendsService.unblockUser(req.user['id'], params.id);
            this.chatGateway.server.to(`user-${req.user['id']}`).emit("unblocked", params.id);
        } catch (e) {
            // TODO: throw an error maybe ?
        }
    }
    
}
