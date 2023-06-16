import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UserService } from '../user/user.service';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class DmsService {
    constructor(
        private db: DbService,
        private userService: UserService,
        private friendsService: FriendsService,
    ) { }

    async getDMMessages(requester_id: number, interlocutor_id: number) {
        return this.db.privateMessage.findMany({
            where: {
                OR: [
                    {
                        sender_id: requester_id,
                        receiver_id: interlocutor_id,
                    },
                    {
                        sender_id: interlocutor_id,
                        receiver_id: requester_id,
                    }
                ]
            },
            orderBy: {
                timestamp: 'desc',
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
        })
    }

    async createMessage(sender_id: number, to_id: number, content: string) {
        if (content.length > 2000 || content.length < 1) {
            throw new BadRequestException("Invalid message length");
        }
        const areFriends = await this.friendsService.areFriends(sender_id, to_id);
        if (!areFriends) {
            throw new BadRequestException("Users are not friends");
        }
        return this.db.privateMessage.create({
            data: {
                sender_id: sender_id,
                receiver_id: to_id,
                content,
            },
            select: {
                sender: {
                    select: {
                        avatar: true,
                        name: true,
                        id: true
                    }
                },
                content: true,
                message_id: true,
                receiver_id: true,
                sender_id: true,
                timestamp: true,
            }
        })
    }

    async deleteMessage(message_id: number) {
        return this.db.privateMessage.delete({
            where: {
                message_id: message_id,
            }
        })
    }

    async getMessage(message_id: number) {
        return this.db.privateMessage.findUnique({
            where: {
                message_id: message_id,
            },
            select: {
                sender: {
                    select: {
                        avatar: true,
                        name: true,
                        id: true
                    }
                },
                content: true,
                message_id: true,
                receiver_id: true,
                sender_id: true,
                timestamp: true,
            }
        })
    }
}
