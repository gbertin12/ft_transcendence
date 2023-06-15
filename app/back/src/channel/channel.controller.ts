import { Controller, Post, Body, Get, Param, HttpException, Delete, Patch, UseGuards, Req, BadRequestException, NotFoundException, Put, ForbiddenException, NotImplementedException } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Length, Matches } from 'class-validator';
import ChatGateway from '../chat/chat.gateway';
import { Channel, Message, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { MessageData } from '../interfaces/chat.interfaces';
import { PunishmentsService } from '../punishments/punishments.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

class ChannelDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    channel_id: number;
}

class ChannelUpdateDto {
    @Type(() => String)
    @Length(1, 20)
    @Matches(/^[^#\s]+$/) // No spaces or #
    name: string;

    @Type(() => Boolean)
    private: boolean;

    @Type(() => String || null)
    password: string | null;
}

class ChannelPasswordDto {
    @Type(() => String)
    @Length(2, 100)
    password: string;
}

class GenericIdDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    id: number;
}

class OwnershipTransferDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    new_owner: number

    // Optionnal 2FA code
    @Type(() => String)
    @Matches(/^[0-9]{6}$/) // Only 6 digits
    @IsOptional() // The user might not always have 2FA enabled
    code: string;

    // Optionnal password (if the user has 2FA setup, we're using the 2FA instead)
    @Type(() => String)
    @Length(2, 100)
    password: string;
}

@Controller('channel')
export class ChannelController {
    constructor(
        private channelService: ChannelService,
        private chatGateway: ChatGateway,
        private punishmentsService: PunishmentsService,
        private userService: UserService,
        private authService: AuthService,
    ) { }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('all')
    async allUsers(@Req() req) {
        return await this.channelService.allChannels(req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(':channel_id/messages')
    async channelMessages(@Param() dto: ChannelDto, @Req() req) {
        // Check if user is banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }
        return await this.channelService.getMessages(dto.channel_id, req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/message')
    async createMessage(@Param() dto: ChannelDto, @Body() body: any, @Req() req) {
        if (!body || !body.content) { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000) { throw new HttpException('Message too long', 400); }

        // TODO: Check that the channel exists (insert would fail in theory)
        // TODO: Check that the user has access to the channel

        // Check that the user is not muted
        if (await this.punishmentsService.hasActiveMute(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are muted in this channel', 403);
        }

        let senderId = req.user['id'];
        let message: Message = await this.channelService.createMessage(senderId, dto.channel_id, body.content);
        let data: MessageData = {
            content: message.content,
            timestamp: message.timestamp,
            sender: req.user,
            message_id: message.message_id,
        }
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('message', data);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('create')
    async createChannel(@Body() body: any, @Req() req) {
        let ownerId = req.user['id'];
        let channel: Channel = await this.channelService.createChannel(body.name, ownerId, body.private, body.password);
        if (body.private) {
            // Emit only creation to the owner
            this.chatGateway.usersClients[ownerId].emit('newChannel', channel);
        } else {
            this.chatGateway.server.emit('newChannel', channel);
        }
        return channel;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete(':channel_id')
    async deleteChannel(@Param() dto: ChannelDto, @Req() req) {
        let userId = req.user['id'];
        await this.channelService.deleteChannel(dto.channel_id, userId);
        this.chatGateway.server.emit('deleteChannel', dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Patch(':channel_id')
    async updateChannel(@Param() dto: ChannelDto, @Body() body: ChannelUpdateDto, @Req() req) {
        let userId = req.user['id'];
        let channel: any = await this.channelService.getChannel(dto.channel_id);
        if (!channel) { throw new HttpException('Channel not found', 404); }
        if (channel.owner_id !== userId) { throw new HttpException('You are not the owner of this channel', 403); }

        // if password is null, remove it in the db
        if (body.password === null) {
            channel.password = null;
        }
        else if (body.password !== '') { // otherwise if password isn't empty, hash it
            const hash = await argon2.hash(body.password);
            channel.password = hash;
        }

        channel.name = body.name;

        // update the channel
        let updatedChannel: Channel = await this.channelService.updateChannel(dto.channel_id, channel);
        this.chatGateway.server.emit('editChannel', updatedChannel);
        return updatedChannel;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/join')
    async joinChannel(@Param() dto: ChannelDto, @Body() body: ChannelPasswordDto, @Req() req) {
        let channelPassword: string = (await this.channelService.getChannel(dto.channel_id)).password;

        if (channelPassword === null) {
            throw new HttpException('Channel has no password', 400);
        }

        // Check if user has been banned
        if (await this.punishmentsService.hasActiveBan(dto.channel_id, req.user['id'])) {
            throw new HttpException('You are banned from this channel', 403);
        }

        if (!await argon2.verify(channelPassword, body.password)) {
            throw new HttpException('Invalid password', 401);
        }

        let userId = req.user['id'];
        let result = await this.channelService.joinChannel(dto.channel_id, userId);
        if (result) {
            this.chatGateway.server.emit('joinChannel', { channel_id: dto.channel_id, user_id: userId });
            return { status: 201 };
        } else {
            throw new HttpException('You are already in this channel', 400);
        }
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/invite')
    async inviteUser(@Param() dto: ChannelDto, @Body() body: GenericIdDto, @Req() req) {
        const senderId = req.user['id'];
        const receiverId = body.id;
        if (senderId === receiverId) {
            throw new BadRequestException("You cannot invite yourself to a channel");
        }
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (!channel.private || channel.password !== null) {
            throw new BadRequestException("You cannot invite someone to a public channel, or a private channel with a password");
        }
        // No special permission is required to invite someone to a private channel
        this.channelService.inviteToChannel(
            senderId,
            receiverId,
            dto.channel_id,
        )
        let users: number[] = [senderId, receiverId]
        users.forEach((userId) => {
            if (this.chatGateway.usersClients[userId]) {
                this.chatGateway.usersClients[userId].emit('invite', {
                    channel: channel,
                    channel_id: dto.channel_id,
                    sender: req.user,
                });
            }
        })
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Delete(':channel_id/invite')
    async cancelInvite(@Param() dto: ChannelDto, @Body() body: GenericIdDto, @Req() req) {
        this.channelService.revokeInvite(
            req.user['id'],
            body.id,
            dto.channel_id,
        )
        let users: number[] = [req.user['id'], body.id]
        users.forEach((userId) => {
            if (this.chatGateway.usersClients[userId]) {
                this.chatGateway.usersClients[userId].emit('cancelInvite', {
                    channel_id: dto.channel_id,
                });
            }
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/invite')
    async acceptInvite(@Param() dto: ChannelDto, @Body() body: GenericIdDto, @Req() req) {
        this.channelService.acceptInvite(
            req.user['id'],
            body.id,
            dto.channel_id,
        )
        let users: number[] = [req.user['id'], body.id]
        users.forEach((userId) => {
            if (this.chatGateway.usersClients[userId]) {
                this.chatGateway.usersClients[userId].emit('acceptInvite', {
                    channel_id: dto.channel_id,
                });
            }
        });
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Put(':channel_id/leave')
    async leaveChannel(@Param() dto: ChannelDto, @Req() req) {
        // User cannot leave if he's the owner, he must delete the channel OR transfer ownership
        const userId = req.user['id'];
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (!channel.private) {
            throw new BadRequestException("You cannot leave a public channel");
        }
        if (channel.owner_id === userId) {
            throw new ForbiddenException("You cannot leave a channel you own, delete it instead or transfer ownership");
        }
        await this.channelService.leaveChannel(dto.channel_id, userId);
        // Send a socket message
        if (this.chatGateway.usersClients[userId]) {
            this.chatGateway.usersClients[userId].emit('leaveChannel', {
                channel_id: dto.channel_id,
            });
        }
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Patch(':channel_id/transfer')
    async transferOwnership(@Param() dto: ChannelDto, @Body() body: OwnershipTransferDto, @Req() req) {
        if (!body.password && !body.code) {
            throw new BadRequestException("Missing authentication fields");
        }
        const userId = req.user['id'];
        const channel = await this.channelService.getChannel(dto.channel_id);
        if (!channel) {
            throw new NotFoundException("Unknown channel");
        }
        if (channel.owner_id !== userId) {
            throw new ForbiddenException("You are not the owner of this channel");
        }

        // Get new owner data for system message
        let user = await this.userService.getUserById(body.new_owner);

        if (!user) {
            throw new NotFoundException("Unknown user");
        }

        if (body.password) {
            if (!await argon2.verify(channel.password, body.password)) {
                throw new HttpException('Invalid password', 401);
            }
        }

        if (body.code && !await this.authService.verifyOTP(req.user['id'], body.code)) {
            throw new HttpException('Invalid code', 401);
        }

        // Update ownership
        this.channelService.setOwner(body.new_owner, dto.channel_id);

        // Send a system message and a socket ping to the channel to update roles / badges
        let systemPayload = {
            // custom system message
            content: `${req.user['name']} transferred its ownership to ${user.name}`,
            message_id: Math.floor(Math.random() * 1000000000), // todo: use service's systemMessageStack
            sender: { avatar: null, id: -1, username: "System", },
            timestamp: new Date(),
        };

        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('message', systemPayload);
        this.chatGateway.server.to(`channel-${dto.channel_id}`).emit('updateOwner', {
            channel_id: dto.channel_id,
            new_owner: body.new_owner,
        });
    }
}
