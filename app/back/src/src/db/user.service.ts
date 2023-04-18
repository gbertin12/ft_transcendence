import { Injectable } from '@nestjs/common';
import { DbService } from './db.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private db: DbService) {}

    async findOrCreate(data: User): Promise<User> {
        // find user by id
        let user = await this.db.user.findUnique({
            where: { id: data.id }
        });

        // user not found: create it
        if (!user) {
            user = await this.db.user.create({
                data: data
            });
        }

        return user;
    }
}
