import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Friend } from '.prisma/client';

@Injectable()
export class FriendsService {
    constructor(private dbService: DbService) { }

    async getUserFriends(userId: number): Promise<Friend[]> {
        return this.dbService.friend.findMany({
            where: {
                user_id: userId,
            },
            include: {
                user: true,
            }
        });
    }
}