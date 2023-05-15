import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DbService } from '../db/db.service';

function generateRandomString(len: number) {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from(
        { length: len },
        (_, __) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join('');
    return randomString;
};

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
        // can't use update because it only wants unique fields on the 'where'
        await this.db.user.updateMany({
            data: { otp: true, otpSecret },
            where: { id, otp: false },
        });
    }

    // create a new user if it doesn't already exist
    async createUser(name: string, password: string = null): Promise<User> {
        const user = await this.db.user.upsert({
            where: { name },
            update: {},
            create: { name, password },
        });
        return user;
    }

    async createDummyUser(): Promise<User> {
        const name = generateRandomString(8);
        const password = 'password';
        const user = await this.db.user.upsert({
            where: { name },
            update: {},
            create: { name, password },
        });
        return user;
    }

    async incrementWin(name: string) {
        await this.db.user.update({
            data: {
                wins: { increment: 1 }
            },
            where: { name },
        });
    }

    async incrementLoose(name: string) {
        await this.db.user.update({
            data: {
                losses: { increment: 1 }
            },
            where: { name },
        });
    }
}
