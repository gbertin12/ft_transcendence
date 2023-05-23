import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Friend } from '.prisma/client';
import { User } from '.prisma/client';
import { FriendRequest } from '.prisma/client';

@Injectable()
export class FriendsService {
    constructor(private dbService: DbService) { }

    async getUserFriends(userId: number): Promise<Friend[]> {
        // return each friend with their user info, where user_id = userId or friend_id = userId, unique results only
        return this.dbService.friend.findMany({
            where: {
                OR: [
                    {
                        user_id: userId,
                    },
                    {
                        friend_id: userId,
                    },
                ],
            },
            distinct: ['user_id', 'friend_id'],
            include: {
                user: true,
            },
        });
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
                user_id: user_id,
                OR: {
                    friend_id: user_id,
                }
            },
            include: {
                user: true,
            }
        });
    }
}