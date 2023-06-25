import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as OTPAuth from 'otpauth';
import * as argon2 from 'argon2';

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
async function getProfile(access_token: string): Promise<string> {
    try {
        const response = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { 'Authorization': `Bearer ${access_token}` },
        });
        if (response?.ok) {
            const user = await response.json();
            return user.login;
        }
        console.log('42 INTRA DEAD (AGAIN)??');
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
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async register(username: string, password: string): Promise<boolean> {
        try {
            await this.userService.getUserByName(username);
            return false;
        } catch (_) {
            const hashed_pass = await argon2.hash(password);
            this.userService.createUser(username, hashed_pass);
            return true;
        }
    }

    async verifyState(state_param: string, state_cookie: string): Promise<Boolean> {
        const payload = await this.jwtService.verifyAsync(state_cookie);
        return state_param === payload.state;
    }

    async generateJWT(id: number, otpAuth = false): Promise<string> {
        const token = await this.jwtService.signAsync({ id, otpAuth });
        return token;
    }

    async ftCallback(
        auth_code: string,
        state_param: string,
        state_cookie: string
    ): Promise<User> {

        if (!await this.verifyState(state_param, state_cookie)) {
            throw new HttpException('Invlalid state parameter', HttpStatus.UNAUTHORIZED);
        }
        const token_url = 'https://api.intra.42.fr/oauth/token';
        const params = {
            redirect_uri: `${process.env.CALLBACK_URL}/42/callback`,
            client_id: process.env.FT_CLIENT_ID,
            client_secret: process.env.FT_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: auth_code,
        };
        const options = {
            method: 'POST',
            body: buildBody(params),  // turns 'params' object into a multipart/form-data body
        };

        // send a POST request to the authorization server
        // to exchange the authorization code for an access token
        // that can be used to query the API
        try {
            const response = await fetch(token_url, options);
            if (response?.ok) {
                const data = await response.json();
                // get user data from 42 API
                const username = await getProfile(data.access_token);
                const user = await this.userService.createUser(username);
                return user;
            }
            throw new HttpException('OAuth login failed', HttpStatus.UNAUTHORIZED);
        } catch (error) {
            // TODO: better error handling
            if (error instanceof SyntaxError) {
                console.log('got malformed json');
            } else {
                console.log(error);
            }
            throw new HttpException('unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async generateStateToken() {
        const state = randomUUID();
        const payload = { state };
        const state_token = await this.jwtService.signAsync(payload);
        return { state, state_token };
    }

    async generateTOTP() {
        const secret = new OTPAuth.Secret({ size: 42 });
        const totp = new OTPAuth.TOTP({
            issuer: 'ACME',
            label: 'ft_pong',
            algorithm: 'SHA256',
            digits: 6,
            period: 30,
            secret,
        });
        return totp;
    }

    async unsetOTP(id: number) {
        await this.userService.updateOTPSecret(id, null);
    }

    async verifyOTP(id: number, token: string): Promise<Boolean> {
        const otpSecret = await this.userService.getOTPSecretById(id);
        const secret = OTPAuth.Secret.fromBase32(otpSecret);
        const totp = new OTPAuth.TOTP({
            issuer: 'ACME',
            label: 'ft_pong',
            algorithm: 'SHA256',
            digits: 6,
            period: 30,
            secret,
        });
        const result = totp.validate({ token, window: 1 });
        return result !== null;
    }
}
