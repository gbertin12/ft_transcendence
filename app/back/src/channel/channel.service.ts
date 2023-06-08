import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Channel, Message, Punishment, User } from '@prisma/client';
import * as argon2 from 'argon2';
import { ChannelStaff, PowerAction } from '../interfaces/chat.interfaces';

@Injectable()
export class ChannelService {
    constructor(
        private db: DbService,
    ) { }

    async allChannels(user: User) {
        // return whether the password is set or not
        let channels = await this.db.channel.findMany(
            {
                select: {
                    id: true,
                    name: true,
                    owner_id: true,
                    topic: true,
                    password: true,
                    private: false,
                },
                where: {
                    // check access if the channel is private
                    OR: [
                        {
                            private: false
                        },
                        {
                            private: true,
                            channel_access: {
                                some: {
                                    user_id: user.id
                                }
                            }
                        }
                    ]
                },
                orderBy: {
                    creation_date: 'asc',
                }
            }
        );
        channels.forEach((channel) => { // remove the (hashed) password from the response
            channel.password = (channel.password !== null ? '' : null);
            // if (channel.password !== null && channel)
        });
        return channels;
    }

    async getMessages(id: number, user: User) {
        // Check if the user has access to the channel
        let channel = await this.db.channel.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                private: true,
                password: true
            }
        });

        if (!channel) {
            throw new HttpException('Channel not found', 404);
        }

        if (channel.private || channel.password !== null) {
            // Check if the user has access to the channel
            let channel = await this.db.channelAccess.findUnique({
                where: {
                    channel_id_user_id: {
                        channel_id: id,
                        user_id: user.id
                    }
                },
                select: {
                    channel_id: true
                }
            });

            if (!channel) {
                throw new HttpException('You do not have access to this channel', 401);
            }
        }

        return await this.db.message.findMany({
            where: {
                channel_id: id
            },
            orderBy: { // sort from oldest to newest (front-end will reverse it)
                timestamp: 'desc'
            },
            select: {
                sender: {
                    select: {
                        avatar: true,
                        name: true,
                        id: true
                    }
                },
                message_id: true,
                content: true,
                timestamp: true
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
        let newChannel: Channel = await this.db.channel.create({
            data: {
                name: name,
                owner_id: ownerId,
                private: isPrivate,
                password: (password !== '' ? await argon2.hash(password) : null),
                topic: ''
            }
        }).then((channel) => {
            // remove the (hashed) password from the response
            channel.password = (channel.password !== null ? '' : null);
            return channel;
        });

        if (newChannel.password !== null || newChannel.private) {
            // add the owner to the channel access list if the channel is private / has a password
            await this.db.channelAccess.create({
                data: {
                    channel_id: newChannel.id,
                    user_id: ownerId
                },
            });
        }

        return newChannel;
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
        // Delete all channel access entries
        await this.db.channelAccess.deleteMany({
            where: {
                channel_id: channelId
            }
        });
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

    async joinChannel(channelId: number, userId: number) {
        return await this.db.channelAccess.create({
            data: {
                channel_id: channelId,
                user_id: userId
            }
        });
    }

    async getChannelStaff(channelId: number): Promise<ChannelStaff> {
        let staff: ChannelStaff = {
            owner_id: -1,
            administrators: [],
        }
        await this.db.channel.findUnique({
            where: {
                id: channelId
            },
            select: {
                owner_id: true,
                admins: {
                    select: {
                        user_id: true
                    },
                },
            },
        }).then((channel) => {
            staff.owner_id = channel.owner_id;
            staff.administrators = channel.admins.map((admin) => {
                return admin.user_id;
            });
        });
        return staff;
    }
}
