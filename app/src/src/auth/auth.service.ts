import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ConfigService } from '@nestjs/config';

// the authorization server wants the POST data
// in the multipart/form-data Content-Type
function buildBody(params: any): FormData {
    const data = new FormData();
    for (const name in params) {
        data.append(name, params[name]);
    }
    return data;
}

// test function to fetch the 42 login
// using the access token
function getLogin(access_token: string) {
    const options = {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${access_token}` },
    };
    fetch('https://api.intra.42.fr/v2/me', options)
        .then(response => response.json()
        .then(response => {
            console.log(response.login);
        }));
}

@Injectable()
export class AuthService {
    constructor(
        private db: DbService,
        private config: ConfigService
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
            body: buildBody(params),
        };

        // send a POST request to the authorization server
        // to exchange the authorization code for an access token
        // that can be used to query the API
        await fetch(token_url, options)
            .then(response => response.json()
            .then(response => {
                console.log(response);
                getLogin(response.access_token);
            }));
    }
}
