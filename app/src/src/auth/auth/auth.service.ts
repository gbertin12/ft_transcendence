import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class AuthService {
    constructor(private db: DbService) { }

    async login(password: string) {
        // SELECT * FROM user WHERE password = password
        const result = await this.db.user.findFirst({
            where: { password: password }
        });

        return result;
    }

    async signup(username: string, password: string) {
        // must specify ALL fields in the table to insert
        await this.db.user.create({
            data: { username, password, role: 'player' }
        });
    }

    async allUsers() {
        // returns all items in the table
        return await this.db.user.findMany();
    }
}
