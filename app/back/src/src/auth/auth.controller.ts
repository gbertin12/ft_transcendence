import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) { }

    // OAuth callback
    @Get('42/callback')
    async ftCallback(
        @Query('code') auth_code: string,
        @Query('state') state_param: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const state_cookie = req.cookies['state'];
        const user = await this.authService.ftCallback(auth_code, state_param, state_cookie);
        const token = await this.authService.generateJWT(user.id);
        res.cookie('session', token, { httpOnly: true, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    // before starting the OAuth flow, we hit this endpoint
    // to generate a random value (UUID) to act as a CSRF token (state parameter)
    @Get('42/state')
    async generateStateToken(@Res() res: Response) {
        const { state, state_token } = await this.authService.generateStateToken();
        res.cookie('state', state_token, { httpOnly: true, sameSite: 'lax' });
        res.send(state);
    }

    @Get('discord/callback')
    @UseGuards(AuthGuard('discord'))
    async discordCallback(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const user = await this.userService.createUser(req.user.toString());
        const token = await this.authService.generateJWT(user.id);
        res.cookie('session', token, { httpOnly: true, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('2fa/activate')
    async setOTP(@Req() req: Request) {
        const uri = await this.authService.setOTP(req.user['id']);
        return uri;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/verify')
    async verifyOTP(
        @Req() req: Request,
        @Res() res: Response,
        @Body('otp') otp: string,
    ) {
        if (!await this.authService.verifyOTP(req.user['id'], otp)) {
            throw new HttpException('TOTP validation failed', HttpStatus.UNAUTHORIZED);
        }
        const token = await this.authService.generateJWT(req.user['id'], true);
        res.cookie('session', token, { httpOnly: true, sameSite: 'strict' });
        res.end();
    }

    // DON'T PUT THIS IN PROD LMAO
    @Get('2fa/reset/:username')
    async resetOTP(@Param('username') username: string) {
        await this.authService.resetOTP(username);
    }
}
