import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            callbackURL: process.env.CALLBACK_URL,
        });
    }

    async validate(
        accessToken: string,
        _refreshToken: string,
        _profile,
    ) {
        try {
            const res = await fetch('https://api.intra.42.fr/v2/me', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res?.ok) {
                const data = await res.json();
                const user = { id: data.id, login: data.login };
                return user;
            } else {
                console.log('error fetching profile data');
                return 'throw exception?';
            }
        } catch (error) {
            console.log(error);
            return 'throw exception?';
        }
    }
}
