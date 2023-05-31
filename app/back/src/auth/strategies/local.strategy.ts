import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '../../user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super();
    }

    async validate(username: string, password: string) {
        console.log(`username:\t${username}\npassword:\t${password}`);
        try {
            const user = await this.userService.getUserByNameFull(username);
            if (await argon2.verify(user.password, password)) {
                return { id: user.id };
            }
        } catch (_) {
            throw new HttpException('user does not exist', HttpStatus.NOT_FOUND);
        }
    }
}
