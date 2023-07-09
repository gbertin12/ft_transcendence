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
                    private: true,
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

    async getHistory(channel_id: number, user: User, last_message_id: number) {
        // Check if the user has access to the channel
        let channel = await this.db.channel.findUnique({
            where: {
                id: channel_id
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
                        channel_id: channel_id,
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
                channel_id: channel_id,
                message_id: {
                    lt: last_message_id
                }
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
        await this.db.message.deleteMany({
            where: {
                channel_id: channelId
            }
        });
        await this.db.channelInvite.deleteMany({
            where: {
                channel_id: channelId
            }
        });
        await this.db.channel.delete({
            where: {
                id: channelId
            }
        });
    }

    async getChannel(channelId: number) {
        return await this.db.channel.findUnique({
            where: {
                id: channelId
            },
            include: {
                admins: {
                    select: {
                        user_id: true
                    }
                }
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
            if (!channel) {
                return null; // could be a dm
            }
            staff.owner_id = channel.owner_id;
            staff.administrators = channel.admins.map((admin) => {
                return admin.user_id;
            });
        });
        return staff;
    }

    async deleteMessage(messageId: number) {
        return await this.db.message.delete({
            where: {
                message_id: messageId
            }
        });
    }

    async getMessage(messageId: number) {
        return await this.db.message.findUnique({
            where: {
                message_id: messageId
            }
        });
    }

    async getInvites(user_id: number) {
        return await this.db.channelInvite.findMany({
            where: {
                receiver_id: user_id
            },
            include: {
                channel: {
                    select: {
                        id: true,
                        name: true,
                        owner_id: true,
                        private: true,
                        password: true,
                        topic: true
                    },
                },
            },
        }).then((invites) => {
            return invites.map((invite) => {
                const channel = invite.channel;
                channel.password = (channel.password !== null ? '' : null);
                return channel;
            });
        });
    }

    async inviteToChannel(sender_id: number, receiver_id: number, channel_id: number) {
        return this.db.channelInvite.upsert({
            where: {
                receiver_id_channel_id: {
                    receiver_id: receiver_id,
                    channel_id: channel_id,
                }
            },
            create: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                channel_id: channel_id,
            },
            update: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                channel_id: channel_id,
            }
        });
    }

    async revokeInvite(receiver_id: number, channel_id: number) {
        return this.db.channelInvite.delete({
            where: {
                receiver_id_channel_id: {
                    receiver_id: receiver_id,
                    channel_id: channel_id,
                }
            }
        });
    }

    async acceptInvite(receiver_id: number, channel_id: number): Promise<string> {
        await this.db.channelAccess.create({
            data: {
                user_id: receiver_id,
                channel_id: channel_id
            }
        })
        return this.db.channelInvite.delete({
            where: {
                receiver_id_channel_id: {
                    receiver_id: receiver_id,
                    channel_id: channel_id,
                }
            },
            select: {
                sender: {
                    select: {
                        name: true
                    }
                }
            }
        }).then((invite) => {
            return invite.sender.name;
        });
    }

    async leaveChannel(user_id: number, channel_id: number) {
        return this.db.channelAccess.delete({
            where: {
                channel_id_user_id: {
                    channel_id: channel_id,
                    user_id: user_id
                }
            }
        })
    }

    async setOwner(new_owner_id: number, channel_id: number) {
        return this.db.channel.update({
            where: {
                id: channel_id
            },
            data: {
                owner_id: new_owner_id
            }
        })
    }

    async setRole(user_id: number, channel_id: number, power_level: number) {
        switch (power_level) {
            case 0: // user, remove from administrators
                await this.db.channelAdmin.delete({
                    where: {
                        channel_id_user_id: {
                            channel_id: channel_id,
                            user_id: user_id
                        }
                    }
                });
                break;
            case 1:
                await this.db.channelAdmin.upsert({
                    where: {
                        channel_id_user_id: {
                            channel_id: channel_id,
                            user_id: user_id
                        }
                    },
                    create: {
                        channel_id: channel_id,
                        user_id: user_id
                    },
                    update: {
                        channel_id: channel_id,
                        user_id: user_id
                    }
                });
                break;
        }
    }

    async isUserInChannel(channel_id: number, user_id: number) {
        // Check if channel is private, if so, check if user is in channel otherwise return true
        let channel = await this.db.channel.findUnique({
            where: {
                id: channel_id
            },
            select: {
                private: true
            }
        });
        if (channel.private) {
            return await this.db.channelAccess.findUnique({
                where: {
                    channel_id_user_id: {
                        channel_id: channel_id,
                        user_id: user_id
                    }
                }
            });
        } else {
            return true;
        }
    }

    async getPunishments(channel_id: number) {
        return await this.db.punishment.findMany({
            where: {
                channel_id: channel_id,
                expires_at: {
                    gt: new Date()
                }
            },
            orderBy: {
                punished_at: "desc"
            },
            include: {
                punished: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                        otp: false,
                        password: false,
                        otpSecret: false,
                    },
                },
                punisher: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                        otp: false,
                        password: false,
                        otpSecret: false,
                    },
                }
            }
        });
    }

    async getMembers(channel_id: number) {
        // get all admins and owner, along with all users in channel via channelAccess if channel is private, otherwise return
        // run all queries in parallel and await them all
        let channel = await this.db.channel.findUnique({
            where: {
                id: channel_id
            },
            select: {
                private: true
            }
        });
        let [admins, owner, users] = await Promise.all([
            this.db.channel.findFirst({
                where: {
                    id: channel_id
                },
                select: {
                    admins: {
                        select: {
                            user: {
                                select: {
                                    avatar: true,
                                    elo: true,
                                    id: true,
                                    losses: true,
                                    name: true,
                                    wins: true,
                                    otp: false,
                                    password: false,
                                    otpSecret: false,
                                },
                            }
                        }
                    }
                }
            }),
            this.db.channel.findFirst({
                where: {
                    id: channel_id
                },
                select: {
                    owner: {
                        select: {
                            avatar: true,
                            elo: true,
                            id: true,
                            losses: true,
                            name: true,
                            wins: true,
                            otp: false,
                            password: false,
                            otpSecret: false,
                        },
                    }
                }
            }),
            // If the channel is private, find all users in the channel, otherwise find all users that sent a message in the channel
            channel.private ? this.db.channelAccess.findMany({
                where: {
                    channel_id: channel_id
                },
                select: {
                    user: {
                        select: {
                            avatar: true,
                            elo: true,
                            id: true,
                            losses: true,
                            name: true,
                            wins: true,
                            otp: false,
                            password: false,
                            otpSecret: false,
                        },
                    }
                }
            }) : this.db.message.findMany({
                where: {
                    channel_id: channel_id
                }, // Select distinct users
                select: {
                    sender: {
                        select: {
                            avatar: true,
                            elo: true,
                            id: true,
                            losses: true,
                            name: true,
                            wins: true,
                            otp: false,
                            password: false,
                            otpSecret: false,
                        },
                    },
                },
                distinct: ['sender_id']
            })
        ]);
        if (channel.private) {
            return {
                owner: owner.owner,
                admins: admins.admins.map((admin) => admin.user),
                users: users.map((user) => user.user).filter((user) => {
                    return !admins.admins.some((admin) => admin.user.id == user.id) && owner.owner.id != user.id;
                })
            }
        } else {
            return {
                owner: owner.owner,
                admins: admins.admins.map((admin) => admin.user),
                // remove users that are admins or owner
                users: users.map((user) => user.sender).filter((user) => {
                    return !admins.admins.some((admin) => admin.user.id == user.id) && owner.owner.id != user.id;
                })
            }
        }
    }

    async getInvitations(channel_id: number) {
        return await this.db.channelInvite.findMany({
            where: {
                channel_id: channel_id
            },
            select: {
                receiver_id: true,
            }
        });
    }
}
