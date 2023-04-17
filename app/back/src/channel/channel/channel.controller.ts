import { Controller, Post, Body, Get, Param, HttpException } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(private channelService: ChannelService) { }

    // /channel/all
    @Get('all')
    async allUsers() {
        return await this.channelService.allChannels();
    }

    @Get(':id/messages')
    async channelMessages(@Param("id") id: string) {
        let channelId: number = -1;
        try {
            channelId = parseInt(id);
        } catch (error) {
            throw new HttpException('Invalid Channel ID', 400);
        }
        return await this.channelService.getMessages(channelId);
    }

    @Post(':id/message')
    async createMessage(@Param("id") id: string, @Body() body: any) {
        let channelId: number = -1;
        try {
            channelId = parseInt(id);
        } catch (error)                     { throw new HttpException('Invalid Channel ID', 400); }
        if (!body || !body.content)         { throw new HttpException('Invalid Message', 400); }
        if (body.content.length > 2000)     { throw new HttpException('Message too long', 400); }

        // TODO: Check that the channel exists
        // TODO: Check that the user is in the channel
        // TODO: Get userId with session / cookies / token / whatever
        let senderId = 1;
        return await this.channelService.createMessage(senderId, channelId, body.content);
    }
}
