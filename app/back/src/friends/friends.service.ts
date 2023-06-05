import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Friend } from '.prisma/client';
import { User } from '.prisma/client';
import { FriendRequest } from '.prisma/client';

@Injectable()
export class FriendsService {
    constructor(private dbService: DbService) { }

    async getUserFriends(user: User): Promise<Friend[]> {
        // return each friend with their user info, where user_id = userId or friend_id = userId, unique results only
        let relations: any[] = await this.dbService.friend.findMany({
            where: {
                OR: [
                    {
                        user_id: user.id,
                    },
                    {
                        friend_id: user.id,
                    },
                ],
            },
            distinct: ['user_id', 'friend_id'],
            select: {
                user: {
                    select: { // don't leak any sensitive info
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
                user_id: true,
                friend_id: true,
            },
        });
        // for each friend, if friend_id = userId, swap user_id and friend_id and set user to asynchrously get the user info
        relations = await Promise.all(relations.map(async (relation) => {
            if (relation.friend_id === user.id) {
                const friend = relation.user;
                relation.user = await this.dbService.user.findUnique({
                    where: {
                        id: relation.user_id,
                    },
                    select: { // don't leak any sensitive info
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
                });
                // swap user_id and friend_id
                relation.friend_id = relation.user.id;
                relation.user_id = user.id;
                relation.user.friend = friend;
            }
            return relation;
        }));
        return relations;
    }

    async getUserFriendRequests(userId: number): Promise<FriendRequest[]> {
        return this.dbService.friendRequest.findMany({
            where: {
                receiver_id: userId,
                requested_at: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                }
            },
            include: {
                sender: true,
            }
        });
    }

    async addFriend(sender: User, userId: number): Promise<FriendRequest> {
        // TODO: consider upsert to avoid duplicate requests
        return this.dbService.friendRequest.create({
            data: {
                sender_id: sender.id,
                receiver_id: userId,
            },
        });
    }

    async deleteFriendRequest(receiver_id: number, requestId: number): Promise<FriendRequest> {
        // Check if the request belongs to the user
        const request = await this.dbService.friendRequest.findUnique({
            where: {
                request_id: requestId,
            }
        });
        if (request.receiver_id !== receiver_id) {
            throw new Error('Invalid request');
        }
        return this.dbService.friendRequest.delete({
            where: {
                request_id: requestId,
            },
        });
    }

    async acceptFriendRequest(receiver_id: number, requestId: number): Promise<any> {
        // Check if the request belongs to the user
        const request = await this.dbService.friendRequest.findUnique({
            where: {
                request_id: requestId,
            }
        });
        if (request.receiver_id !== receiver_id) {
            throw new Error('Request does not belong to the user');
        } 
        // Create a new friend
        return this.dbService.friend.create({
            data: {
                user_id: receiver_id,
                friend_id: request.sender_id,
            },
            select: {
                user: true,
                user_id: true,
                friend_id: true,
            }
        });
    }

    async getFriends(user_id: number): Promise<Friend[]> {
        return this.dbService.friend.findMany({
            where: {
                OR: [
                    {
                        user_id: user_id,
                    },
                    {
                        friend_id: user_id,
                    },
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                    }
                }
            },
        });
    }
}