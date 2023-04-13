import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ConfigService } from '@nestjs/config';

function buildBody(params: any): FormData {
    const data = new FormData();
    for (const name in params) { data.append(name, params[name]); }
    return data;
}

@Injectable()
export class AuthService {
    constructor(
        private db: DbService,
        private config: ConfigService
    ) { }

    async callback(code: string) {
        const token_url = 'https://api.intra.42.fr/oauth/token';
        const params = {
            grant_type: 'authorization_code',
            client_id: this.config.get('CLIENT_ID'),
            client_secret: this.config.get('CLIENT_SECRET'),
            code,
            redirect_uri: 'http://localhost:3000/auth/callback',
        };
        const options = {
            method: 'POST',
            body: buildBody(params),
        };

        // send a POST request to the authorization server
        // to exchange the authorization code for an access token
        // that can be used to query the API
        await fetch(token_url, options)
            .then(response => response.json()
            .then(response => {
                console.log(response);
            }));
    }
}
