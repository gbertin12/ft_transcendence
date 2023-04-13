import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy) {
    constructor(
        private authService: AuthService,
        private config: ConfigService
    ) {
        super({
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            callbackURL: 'http://localhost:3000/auth/callback',
            clientID: config.get('CLIENT_ID'),
            clientSecret: config.get('CLIENT_SECRET'),
        });
    }

    validate(accessToken: string, refreshToken: string, profile: any, cb: any) {
        console.debug(`access token: ${accessToken}\nrefresh token: ${refreshToken}\nprofile: ${profile}\ncb: ${cb}`);
    }
}

