import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                req => req.cookies['token']
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SIGN_KEY,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.getUserById(payload.id);
        if (!user.otp) {
            return payload;
        }
        if (payload.otpAuth) {
            return payload;
        }
    }
}
