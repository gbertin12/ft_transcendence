import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // OAuth callback
    // should contain a `code` parameter which will be exchanged
    // for an access token
    @Get('callback')
    async callback(@Query('code') auth_code: string) {
        // TODO: use `state` parameter as CSRF token
        await this.authService.callback(auth_code);
    }
}
