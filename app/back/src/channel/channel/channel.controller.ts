import { Controller, Post, Body, Get, Param, HttpException, Delete } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

class ChannelDto {
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	channel_id: number;
}

@Controller('channel')
export class ChannelController {
    constructor(private channelService: ChannelService) { }

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
        return await this.channelService.createMessage(senderId, dto.channel_id, body.content);
    }

    @Post('create')
    async createChannel(@Body() body: any) {
        let ownerId = 1;
        return await this.channelService.createChannel(body.name, ownerId, body.private, body.password);
    }

    @Delete(':channel_id')
    async deleteChannel(@Param() dto: ChannelDto) {
        // TODO: Get userId with session / cookies / token / whatever
        let userId = 1;
        return await this.channelService.deleteChannel(dto.channel_id, userId);
    }
}
