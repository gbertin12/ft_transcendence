import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

// top level route
// /auth
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // /auth/login
    @Post('login')
    async login(@Body('password') password: string) {
        return await this.authService.login(password);
    }

    // /auth/signup
    @Post('signup')
    async signup(
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        await this.authService.signup(username, password);
        return 'account created';
    }

    // /auth/all
    @Get('all')
    async allUsers() {
        return await this.authService.allUsers();
    }
}
