import { Controller, Post, Body, Get, Param, HttpException, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, Length, Matches } from 'class-validator';
import ChatGateway, { usersChannels } from '../gateway/chat.gateway';
import { Channel, Message } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import * as argon2 from 'argon2';
import { MessageData } from '../interfaces/chat.interfaces';

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

@Controller('channel')
export class ChannelController {
    constructor(
        private channelService: ChannelService,
        private chatGateway: ChatGateway,
    ) { }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('all')
    async allUsers(@Req() req) {
        return await this.channelService.allChannels(req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(':channel_id/messages')
    async channelMessages(@Param() dto: ChannelDto, @Req() req) {
        return await this.channelService.getMessages(dto.channel_id, req.user);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/message')
    async createMessage(@Param() dto: ChannelDto, @Body() body: any, @Req() req) {
        if (!body || !body.content) { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000) { throw new HttpException('Message too long', 400); }

        // TODO: Check that the channel exists
        // TODO: Check that the user is in the channel
        let senderId = req.user['id'];
        let message: Message = await this.channelService.createMessage(senderId, dto.channel_id, body.content);
        let data: MessageData = {
            content: message.content,
            timestamp: message.timestamp,
            sender: {
                avatar: req.user['avatar'],
                name: req.user['name'],
                id: req.user['id'],
            },
            message_id: message.message_id,
        }
        // TODO: Emit to socket.io room
        for (const [id, channel] of Object.entries(usersChannels)) {
            if (channel === dto.channel_id) {
                this.chatGateway.server.to(id).emit('message', data);
            }
        }
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('create')
    async createChannel(@Body() body: any, @Req() req) {
        let ownerId = req.user['id'];
        let channel: Channel = await this.channelService.createChannel(body.name, ownerId, body.private, body.password);
        this.chatGateway.server.emit('newChannel', channel);
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

        if (!await argon2.verify(channelPassword, body.password)) {
            throw new HttpException('Invalid password', 403);
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
}
