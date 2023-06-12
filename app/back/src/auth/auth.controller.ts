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
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) { }

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
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    // TODO: CHANGE DISCORD STUFF
    @Get('discord/callback')
    @UseGuards(AuthGuard('discord'))
    async discordCallback(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const user = await this.userService.createUser(req.user.toString());
        const token = await this.authService.generateJWT(user.id);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const user = await this.userService.createUser(req.user.toString());
        const token = await this.authService.generateJWT(user.id);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    @Post('register')
    async register(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        if (!await this.authService.register(username, password)) {
            throw new HttpException('user already exists', HttpStatus.FORBIDDEN);
        }
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const token = await this.authService.generateJWT(req.user['id']);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }

    // before starting the OAuth flow, we hit this endpoint
    // to generate a random value (UUID) to act as a CSRF token (state parameter)
    @Get('42/state')
    async generateStateToken(@Res() res: Response) {
        const { state, state_token } = await this.authService.generateStateToken();
        res.cookie('state', state_token, { httpOnly: false, sameSite: 'lax' });
        res.send(state);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('2fa/enable')
    async setOTP(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const uri = await this.authService.setOTP(req.user['id']);
        //const token = await this.authService.generateJWT(req.user['id'], true);
        //res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.send(uri);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('2fa/disable')
    async unsetOTP(
        @Req() req: Request,
        @Res() res: Response
    ) {
        await this.authService.unsetOTP(req.user['id']);
        const token = await this.authService.generateJWT(req.user['id']);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.end();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/verify')
    async verifyOTP(
        @Req() req: Request,
        @Res() res: Response,
        @Body('code') code: string,
    ) {
        if (!await this.authService.verifyOTP(req.user['id'], code)) {
            throw new HttpException('TOTP validation failed', HttpStatus.UNAUTHORIZED);
        }
        const token = await this.authService.generateJWT(req.user['id'], true);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.end();
    }
    @Get('dummy')
    async dummy(
        @Res() res: Response,
    ) {
        const user = await this.userService.createDummyUser();
        const token = await this.authService.generateJWT(user.id);
        res.cookie('session', token, { httpOnly: false, sameSite: 'strict' });
        res.redirect(302, `${process.env.FRONT_URL}/profile`);
    }
}
