import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                req => req.cookies['session']
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SIGN_KEY,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.getUserByIdFull(payload.id);
        if (!user.otp) {
            return user;
        }
        if (payload.otpAuth) {
            return user;
        }
    }
}
