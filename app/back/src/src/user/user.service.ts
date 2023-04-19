import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private db: DbService) {}

    async getUserById(id: number) {
        const user = await this.db.user.findUnique({
            where: { id },
        });
        return user;
    }

    async getUserByName(name: string) {
        const user = await this.db.user.findUnique({
            where: { name },
        });
        return user;
    }

    async updateUser(id: number, data: User) {
        delete data.id;
        await this.db.user.update({
            // TODO: MAKE SURE 'id' IS NOT IN 'data' (i think it's ok)
            data,
            where: { id },
        });
    }

    async findOrCreate(data: User) {
        // find user by id
        let user_id = await this.db.user.findUnique({
            where: { id: data.id },
            select: { id: true },
        });

        // user not found: create it
        if (!user_id) {
            user_id = await this.db.user.create({
                data,
                select: { id: true },
            });
        }

        return user_id;
    }
}
