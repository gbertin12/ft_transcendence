import { Controller, Post, Body, Get, Param, HttpException, Delete, Patch } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive, Length, Matches } from 'class-validator';
import { sha512 } from 'sha512-crypt-ts';
import ChatGateway, { usersChannels } from '../gateway/chat.gateway';
import { Channel, Message } from '@prisma/client';

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
    @Get('all')
    async allUsers() {
        return await this.channelService.allChannels();
    }

    @Get(':channel_id/messages')
    async channelMessages(@Param() dto: ChannelDto) {
        return await this.channelService.getMessages(dto.channel_id);
    }

    @Post(':channel_id/message')
    async createMessage(@Param() dto: ChannelDto, @Body() body: any) {
        if (!body || !body.content)         { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000)     { throw new HttpException('Message too long', 400); }

        // TODO: Check that the channel exists
        // TODO: Check that the user is in the channel
        // TODO: Get userId with session / cookies / token / whatever
        let senderId = 1;
        let message: Message = await this.channelService.createMessage(senderId, dto.channel_id, body.content);
        for (const [id, channel] of Object.entries(usersChannels)) {
            if (channel === dto.channel_id) {
                this.chatGateway.server.to(id).emit('message', message);
            }
        }
        return message;
    }

    @Post('create')
    async createChannel(@Body() body: any) {
        let ownerId = 1;
        let channel: Channel = await this.channelService.createChannel(body.name, ownerId, body.private, body.password);
        this.chatGateway.server.emit('newChannel', channel);
        console.log('Created channel', channel);
        return channel;
    }

    @Delete(':channel_id')
    async deleteChannel(@Param() dto: ChannelDto) {
        // TODO: Get userId with session / cookies / token / whatever
        let userId = 1;
        await this.channelService.deleteChannel(dto.channel_id, userId);
        this.chatGateway.server.emit('deleteChannel', dto.channel_id);
    }

    @Patch(':channel_id')
    async updateChannel(@Param() dto: ChannelDto, @Body() body: ChannelUpdateDto) {
        // TODO: Get userId with session / cookies / token / whatever (check if owner)
        let userId = 1;

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
