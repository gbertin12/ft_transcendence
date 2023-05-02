import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                req => req.cookies['session']
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SIGN_KEY,
        });
    }

    async validate(payload: any) {
        return payload;
    }
}
