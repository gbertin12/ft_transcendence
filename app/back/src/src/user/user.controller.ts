import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Req() req: Request) {
        return await this.userService.getUserById(req.user['id']);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me')
    async update(@Req() req: Request, @Body() data: User) {
        return await this.userService.updateUser(req.user['id'], data);
    }

    @Get(':username')
    async view(@Param('username') username: string) {
        return this.userService.getUserByName(username);
    }
}
