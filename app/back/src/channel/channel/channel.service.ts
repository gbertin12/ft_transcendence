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
            orderBy: { // sort from oldest to newest (front-end will reverse it)
                timestamp: 'desc'
            },
            take: 50 // limit to 50 messages
        });
    }

    async createMessage(senderId: number, id: number, content: string) {
        return await this.db.message.create({
            data: {
                sender_id: senderId,
                channel_id: id,
                content: content
            }
        });
    }

    async createChannel(name: string, ownerId: number, isPrivate: boolean, password: string) {
        return await this.db.channel.create({
            data: {
                name: name,
                owner_id: ownerId,
                private: isPrivate,
                password: password, // TODO: Hash password (maybe in the front-end?)
                topic: ''
            }
        });
    }
}
