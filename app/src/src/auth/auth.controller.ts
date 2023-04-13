import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
//import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // OAuth callback
    // should contain a `code` query parameter
    //@UseGuards(AuthGuard('oauth2'))
    @Get('callback')
    async callback(@Query('code') auth_code: string) {
        // TODO: use `state` parameter as CSRF token
        console.log(`authorization code: '${auth_code}'`);
        await this.authService.callback(auth_code);
    }
}
