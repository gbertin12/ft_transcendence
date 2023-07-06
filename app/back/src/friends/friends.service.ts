import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Friend } from '@prisma/client';
import { User } from '@prisma/client';
import { FriendRequest } from '@prisma/client';

@Injectable()
export class FriendsService {
    constructor(private dbService: DbService) { }

    async getUserRelationships(user: User) {
        // return each friend with their user info, where user_id = userId or friend_id = userId, unique results only
        let friendships: any[] = await this.dbService.friend.findMany({
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
                user2: {
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
        let blockedUsers: any[] = await this.dbService.blockedUser.findMany({
            where: {
                user_id: user.id,
            },
            select: {
                blocked_id: true,
                user_id: true,
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
                },
            },
        });
        return {
            friends: friendships,
            blocked: blockedUsers,
        };
    }


    async getUserFriends(user: User): Promise<Friend[]> {
        // return each friend with their user info, where user_id = userId or friend_id = userId, unique results only
        let friendships: any[] = await this.dbService.friend.findMany({
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
                user2: {
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
        return friendships;
    }

    async getUserFriendRequests(userId: number) {
        return this.dbService.friendRequest.findMany({
            where: {
                OR: [
                    {
                        receiver_id: userId,
                        requested_at: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        }
                    },
                    {
                        sender_id: userId,
                        requested_at: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        }
                    },
                ]
            },
            select: {
                sender: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    }
                },
                receiver: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    }
                },
                receiver_id: true,
                sender_id: true,
            }
        });
    }

    async friendRequestExists(sender_id: number, receiver_id: number): Promise<boolean> {
        const request = await this.dbService.friendRequest.findUnique({
            where: {
                sender_id_receiver_id: {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                },
            },
        });
        return !!request;
    }

    async addFriend(sender: User, user_id: number) {
        return this.dbService.friendRequest.upsert({
            where: {
                sender_id_receiver_id: {
                    sender_id: sender.id,
                    receiver_id: user_id,
                }
            },
            update: {},
            create: {
                sender_id: sender.id,
                receiver_id: user_id,
            },
            select: {
                sender_id: true,
                receiver_id: true,
                sender: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    },
                },
                receiver: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    },
                },
            }
        });
    }

    async deleteFriendRequest(receiver_id: number, sender_id: number): Promise<FriendRequest> {
        // Check if the request belongs to the user
        return this.dbService.friendRequest.delete({
            where: {
                sender_id_receiver_id: {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                },
            },
        });
    }

    async acceptFriendRequest(receiver_id: number, sender_id: number): Promise<any> {
        // Check if the request belongs to the user
        const deletedRequest = await this.dbService.friendRequest.delete({
            where: {
                sender_id_receiver_id: {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                },
            },
        });
        if (!deletedRequest) {
            throw new Error('Request does not exist');
        }
        // Create a new friend
        return this.dbService.friend.create({
            data: {
                user_id: receiver_id,
                friend_id: sender_id,
            },
            select: {
                user: true,
                user_id: true,
                friend_id: true,
            }
        });
    }

    async getFriendRequest(sender_id: number, receiver_id: number) {
        return this.dbService.friendRequest.findUnique({
            where: {
                sender_id_receiver_id: {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                },
            },
            select: {
                sender_id: true,
                receiver_id: true,
                sender: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    },
                },
                receiver: {
                    select: {
                        avatar: true,
                        elo: true,
                        id: true,
                        losses: true,
                        name: true,
                        wins: true,
                    },
                },
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

    async deleteFriend(user_id: number, friend_id: number): Promise<boolean> {
        return this.dbService.friend.deleteMany({
            where: {
                OR: [
                    {
                        user_id: user_id,
                        friend_id: friend_id,
                    },
                    {
                        user_id: friend_id,
                        friend_id: user_id,
                    },
                ],
            },
        }).then((res) => {
            return res.count > 0;
        });
    }

    async areFriends(user_id: number, other_id: number): Promise<boolean> {
        return this.dbService.friend.findMany({
            where: {
                OR: [
                    {
                        user_id: user_id,
                        friend_id: other_id,
                    },
                    {
                        user_id: other_id,
                        friend_id: user_id,
                    }
                ]
            },
        }).then((res) => {
            return res.length > 0;
        });
    }
    
    async isBlocked(user_id: number, other_id: number): Promise<boolean> {
        return this.dbService.blockedUser.findUnique({
            where: {
                user_id_blocked_id: {
                    user_id: user_id,
                    blocked_id: other_id,
                },
            },
        }).then((res) => {
            return !!res;
        });
    }

    async blockUser(user_id: number, other_id: number) {
        return this.dbService.blockedUser.upsert({
            where: {
                user_id_blocked_id: {
                    user_id: user_id,
                    blocked_id: other_id,
                },
            },
            update: {},
            create: {
                user_id: user_id,
                blocked_id: other_id,
            },
        });
    }

    async unblockUser(user_id: number, other_id: number) {
        return this.dbService.blockedUser.delete({
            where: {
                user_id_blocked_id: {
                    user_id: user_id,
                    blocked_id: other_id,
                },
            },
        });
    }
}
