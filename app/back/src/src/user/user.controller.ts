import {
    Body,
    Controller,
    FileTypeValidator,
    Get,
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

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Req() req: Request) {
        return await this.userService.getUserById(req.user['id']);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me')
    async updateName(
        @Req() req: Request,
        @Body('name') new_name: string
    ) {
        return await this.userService.updateName(req.user['id'], new_name);
    }

    @Get('profile/:username')
    async getProfile(@Param('username') username: string) {
        return await this.userService.getUserByName(username);
    }

    @UseGuards(AuthGuard('jwt'))
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
