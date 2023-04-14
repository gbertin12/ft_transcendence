import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
    constructor(private channelService: ChannelService) { }

    // /channel/all
    @Get('all')
    async allUsers() {
        return await this.channelService.allChannels();
    }
}
