import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('me')
    async me(@Req() req: Request) {
        const user = await this.userService.getUserById(req.user['id']);
        return user;
    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('me')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Req() req: Request,
        @Body('name') new_name: string,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10000 }),
            ],
            fileIsRequired: false
        })) avatar?: Express.Multer.File,
    ) {
        try {
            await this.userService.updateName(req.user['id'], new_name);
        } catch {
            throw new HttpException(
                `Error: Username '${new_name}' already exists`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (avatar) {
            await this.userService.updateAvatar(req.user['id'], avatar.filename);
            if (req.user['avatar'] !== 'default.jpg') {
                fs.unlinkSync(`/app/files/static/avatars/${req.user['avatar']}`);
            }
            return avatar.filename;
        }
    }

    @Get('profile/:username')
    async getProfile(@Param('username') username: string) {
        try {
            const user = await this.userService.getUserByName(username);
            return user;
        } catch (_) {
            throw new HttpException('NOT FOUND', HttpStatus.NOT_FOUND);
        }
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return await this.userService.getAllUserOrderedByElo();
    }

    @Get('history/:username')
    async getMatchHistory(@Param('username') username: string) {
        return await this.userService.getMatchHistoryByName(username);
    }
}
