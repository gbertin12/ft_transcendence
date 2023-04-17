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
}
