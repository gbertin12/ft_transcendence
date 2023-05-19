import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { sha512 } from 'sha512-crypt-ts';
import { Channel, Message } from '@prisma/client';
import ChatGateway from '../gateway/chat.gateway';

@Injectable()
export class ChannelService {
    constructor(
        private db: DbService,
        private gateway: ChatGateway
    ) { }

    async allChannels() {
        // return whether the password is set or not
        return await this.db.channel.findMany(
            {
                select: {
                    id: true,
                    name: true,
                    owner_id: true,
                    private: true,
                    topic: true,
                    password: true
                }
            }
        );
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

    async createMessage(senderId: number, id: number, content: string): Promise<Message> {
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
                password: (password !== '' ? sha512.crypt(password, "aaaaaaaa") : null), // TODO: Salt password correctly
                topic: ''
            }
        }).then((channel) => {
            // remove the (hashed) password from the response
            channel.password = (channel.password !== null ? '' : null);
            return channel;
        });
    }

    async deleteChannel(channelId: number, userId: number) {
        let channel: any = await this.db.channel.findUnique({
            select: {
                owner_id: true
            },
            where: {
                id: channelId
            }
        });
        // Check if the channel exists
        if (!channel) {
            throw new HttpException('Channel not found', 404);
        }
        // Check if the user is the owner of the channel
        if (channel.owner_id !== userId) {
            throw new HttpException('You are not the owner of this channel', 403);
        }
        await this.db.channel.delete({
            where: {
                id: channelId
            }
        });
        await this.db.message.deleteMany({
            where: {
                channel_id: channelId
            }
        });
    }

    async getChannel(channelId: number) {
        return await this.db.channel.findUnique({
            where: {
                id: channelId
            }
        });
    }

    async updateChannel(channelId: number, editedChannel: Channel) {
        return await this.db.channel.update({
            where: {
                id: channelId
            },
            data: {
                name: editedChannel.name,
                private: editedChannel.private,
                password: editedChannel.password // hashed in the controller
            }
        });
    }
}
