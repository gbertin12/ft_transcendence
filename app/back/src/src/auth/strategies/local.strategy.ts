import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import * as argon2 from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super();
    }

    async validate(username: string, password: string) {
        try {
            const user = await this.userService.getUserByName(username);
            if (await argon2.verify(user.password, password)) {
                return { id: user.id };
            }
        } catch (_) {
            throw new HttpException('user does not exists', HttpStatus.NOT_FOUND);
        }
    }
}
