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
    async updateName(
        @Req() req: Request,
        @Body('name') new_name: string
    ) {
        await this.userService.updateName(req.user['id'], new_name);
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
            return await this.userService.getAllUserOrderedByElo();;

    }

    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10000 }),
            ],
        })) avatar: Express.Multer.File,
        @Req() req: Request
    ) {
        await this.userService.updateAvatar(req.user['id'], avatar.filename);
    }
}
