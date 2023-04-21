import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // OAuth callback
    @Get('oauth/callback')
    async callback(
        @Query('code') auth_code: string,
        @Query('state') state_param: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const state_cookie = req.cookies['state'];
        const user = await this.authService.callback(auth_code, state_param, state_cookie);
        const token = await this.authService.generateJWT(user.id);
        res.cookie('token', token, { httpOnly: true, sameSite: 'none' });
        res.redirect(302, 'http://localhost:8000/profile');
    }

    // before starting the OAuth flow, we hit this endpoint
    // to generate a random value to act as a CSRF token (state parameter)
    @Get('oauth/state')
    async generateStateToken() {
        const state_token = await this.authService.generateStateToken();
        return state_token;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('2fa/activate')
    async setOTP(@Req() req: Request) {
        return this.authService.setOTP(req.user['id']);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/verify')
    async verifyTOTP(
        @Req() req: Request,
        @Res() res: Response,
        @Body('otp') otp: string,
    ) {
        if (!await this.authService.verifyOTP(req.user['id'], otp)) {
            throw new HttpException('TOTP validation failed', HttpStatus.UNAUTHORIZED);
        }
        const token = await this.authService.generateJWT(req.user['id'], true);
        res.cookie('token', token, { httpOnly: true, sameSite: 'none' });
        return 'OK';
    }
}
