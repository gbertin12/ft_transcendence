import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private db: DbService) {}

    async getUserById(id: number): Promise<User> {
        const user = await this.db.user.findUnique({
            where: { id },
        });
        return user;
    }

    async getUserByName(name: string): Promise<User> {
        const user = await this.db.user.findUniqueOrThrow({
            where: { name },
        });
        return user;
    }

    async updateName(id: number, name: string) {
        await this.db.user.update({
            data: { name },
            where: { id },
        });
    }

    async updateAvatar(id: number, filename: string) {
        // TODO: delete previous avatar (except if default)
        await this.db.user.update({
            data: { avatar: filename },
            where: { id },
        });
    }

    async getOTPSecretById(id: number): Promise<string> {
        const user = await this.db.user.findUnique({
            where: { id },
            select: { otpSecret: true },
        });
        return user.otpSecret;
    }

    async updateOTPSecret(id: number, otpSecret: string) {
        await this.db.user.update({
            data: { otp: true, otpSecret },
            where: { id },
        });
    }

    async createUser(user: User) {
        // creates a new user if it doesn't already exist (by id)
        await this.db.user.upsert({
            where: { id: user.id },
            update: {},
            create: user,
        });
    }
}
