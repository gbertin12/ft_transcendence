import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ChannelService {
    constructor(private db: DbService) { }

    async allChannels() {
        return await this.db.channel.findMany();
    }

    async getMessages(id: number) {
        return await this.db.message.findMany({
            where: {
                channel_id: id
            },
            orderBy: { // sort from newest to oldest
                timestamp: 'asc'
            },
            take: 50 // limit to 50 messages
        });
    }
}
