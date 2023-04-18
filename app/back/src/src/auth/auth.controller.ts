import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('callback')
    async callback(
        @Query('code') auth_code: string,
        @Query('state') state_param: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const state_cookie = req.cookies['state'];
        const token = await this.authService.callback(auth_code, state_param, state_cookie);
        res.redirect(302, `http://localhost:8000/login?token=${token}`);
    }

    // before starting the OAuth flow, we hit this endpoint
    // to generate a random value to act as a CSRF token (state parameter)
    @Get('state')
    async generateState(@Req() req: Request) {
        if (req.cookies['state']) {
            return 'abort';
        }
        return await this.authService.generateStateToken();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/profile')
    async profile(@Req() req: Request) {
        return req.user;
    }
}
