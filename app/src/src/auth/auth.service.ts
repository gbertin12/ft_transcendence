import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

// the authorization server wants the POST data
// in the multipart/form-data Content-Type
function buildBody(params: any): FormData {
    const data = new FormData();
    for (const name in params) {
        data.append(name, params[name]);
    }
    return data;
}

// fetch the 42 login using the access token
async function getLogin(access_token: string): Promise<string> {
    const options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${access_token}` },
    };
    try {
        const response = await fetch('https://api.intra.42.fr/v2/me', options);
        if (response?.ok) {
            const data = await response.json();
            return data.login;
        }
        console.log('42 INTRA DEAD (AGAIN)');
        return 'error';
    } catch (error) {
        // TODO: better error handling
        if (error instanceof SyntaxError) {
            console.log('got malformed json');
        } else {
            console.log(error);
        }
    }
}

@Injectable()
export class AuthService {
    constructor(
        private dbService: DbService,
        private config: ConfigService,
        private jwtService: JwtService,
    ) { }

    async callback(auth_code: string) {
        const token_url = 'https://api.intra.42.fr/oauth/token';
        const params = {
            grant_type: 'authorization_code',
            client_id: this.config.get('CLIENT_ID'),
            client_secret: this.config.get('CLIENT_SECRET'),
            code: auth_code,
            redirect_uri: 'http://localhost:3000/auth/callback',
        };
        const options = {
            method: 'POST',
            body: buildBody(params),  // turns `params` object into a multipart/form-data body
        };

        // send a POST request to the authorization server
        // to exchange the authorization code for an access token
        // that can be used to query the API
        try {
            const response = await fetch(token_url, options);
            if (response?.ok) {
                const data = await response.json();
                // get login from 42 API
                const login = await getLogin(data.access_token);
                console.log(`${login} just logged in`);
                const payload = { login };
                return { jwt: await this.jwtService.signAsync(payload) };
            }
            return 'login failed';
        } catch (error) {
            console.log(error);
            // TODO: better error handling
            if (error instanceof SyntaxError) {
                console.log('got malformed json');
            } else {
                console.log(error);
            }
            return 'error';
        }
    }
}
