import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
//import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // OAuth callback
    // should contain a `code` query parameter
    //@UseGuards(AuthGuard('oauth2'))  // passport OAuth strategy
    @Get('callback')
    async callback(
        @Query('code') auth_code: string,
        @Query('state') state: string,
        @Req() req: Request
    ) {
        // TODO: use `state` parameter as CSRF token
        console.log(`authorization code: '${auth_code}'`);
        console.log(`state: '${state}'`);
        console.log(`state cookie: '${req.signedCookies['state']}'`);
        // returns object containing JWT
        return await this.authService.callback(auth_code);
    }

    // before starting the OAuth flow, we hit this endpoint
    // to generate a random value to act as a CSRF token (state parameter)
    @Get('state')
    async generateState(@Req() req: Request) {
        // TODO: ignore requests that already have a `state` cookie
        if (req.signedCookies['state']) {
            return 'abort';
        }
        // returns JWT containing the generated state
        return await this.authService.generateState();
    }
}
