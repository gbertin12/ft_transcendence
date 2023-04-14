import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class ChannelService {
    constructor(private db: DbService) { }

    async allChannels() {
        return await this.db.channel.findMany();
    }
}
