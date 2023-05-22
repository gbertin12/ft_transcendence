import { Controller, Post, Body, Get, Param, HttpException, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, Length, Matches } from 'class-validator';
import { sha512 } from 'sha512-crypt-ts';
import ChatGateway, { usersChannels } from '../gateway/chat.gateway';
import { Channel, Message } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

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

@Controller('channel')
export class ChannelController {
    constructor(
        private channelService: ChannelService,
        private chatGateway: ChatGateway,
    )
    { }

    // /channel/all
    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('all')
    async allUsers(@Req() req) {
        return await this.channelService.allChannels();
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get(':channel_id/messages')
    async channelMessages(@Param() dto: ChannelDto, @Req() req) {
        return await this.channelService.getMessages(dto.channel_id);
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post(':channel_id/message')
    async createMessage(@Param() dto: ChannelDto, @Body() body: any, @Req() req) {
        if (!body || !body.content)         { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000)     { throw new HttpException('Message too long', 400); }

        // TODO: Check that the channel exists
        // TODO: Check that the user is in the channel
        let senderId = req.user['id'];
        let message: Message = await this.channelService.createMessage(senderId, dto.channel_id, body.content);
        // TODO: Emit to room
        for (const [id, channel] of Object.entries(usersChannels)) {
            if (channel === dto.channel_id) {
                this.chatGateway.server.to(id).emit('message', message);
            }
        }
        return message;
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
            channel.password = sha512.crypt(body.password, "aaaaaaaa"); // TODO: Salt password correctly
        }

        channel.name = body.name;

        // update the channel
        let updatedChannel: Channel = await this.channelService.updateChannel(dto.channel_id, channel);
        this.chatGateway.server.emit('editChannel', updatedChannel);
        return updatedChannel;
    }
}
