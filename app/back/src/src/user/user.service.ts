import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private db: DbService) {}

    async getUserById(id: number): Promise<User> {
        try {
            return await this.db.user.findUniqueOrThrow({
                where: { id },
            });
        } catch (_) {
            throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
        }
    }

    async getUserByName(name: string): Promise<User> {
        try {
            return await this.db.user.findUniqueOrThrow({
                where: { name },
            });
        } catch (_) {
            throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
        }
    }

    async updateUser(id: number, data: User) {
        delete data.id;
        delete data.wins;
        delete data.losses;
        delete data.elo;
        // better: extract allowed fields from 'data'
        await this.db.user.update({
            data,
            where: { id },
        });
    }

    async updateAvatar(id: number, path: string) {
        try {
            await this.db.user.update({
                data: { avatar: path },
                where: { id },
            });
        } catch (_) {
            throw new HttpException('NOT ACCEPTABLE', HttpStatus.NOT_ACCEPTABLE)
        }
    }

    async findOrCreate(data: User) {
        // find user by id
        let user_id = await this.db.user.findUnique({
            where: { id: data.id },
            select: { id: true },
        });

        // user not found: create it
        if (user_id === null) {
            user_id = await this.db.user.create({
                data,
                select: { id: true },
            });
        }

        return user_id;
    }
}
