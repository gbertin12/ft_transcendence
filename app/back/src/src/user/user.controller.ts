import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
    Header,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Post,
    Req,
    StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';

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
    async updateUser(@Req() req: Request, @Body() data: User) {
        return await this.userService.updateUser(req.user['id'], data);
    }

    @Get('profile/:username')
    async viewProfile(@Param('username') username: string) {
        return await this.userService.getUserByName(username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('avatar')
    @Header('Content-Type', 'application/json')
    async getAvatar(@Req() req: Request) {
        const user = await this.userService.getUserById(req.user['id']);
        const avatar = createReadStream(user.avatar);
        return new StreamableFile(avatar);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async uploadAvatar(
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10000 }),
                new FileTypeValidator({ fileType: 'image/jpg' }),
            ],
        })) avatar: Express.Multer.File,
        @Req() req: Request
    ) {
        await this.userService.updateAvatar(req.user['id'], avatar.path);
    }

}
