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
    Query,
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
import { Type } from 'class-transformer';
import { IsISO8601, IsNotEmpty } from 'class-validator';

class DateDto {
    @Type(() => () => new Date())
    @IsISO8601()
    date: Date;
}

class UpdateNameDto {
    name: string;
}

class UsernameParamDto {
    @IsNotEmpty()
    username: string
}

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('me')
    async me(@Req() req: Request) {
        const user = await this.userService.getUserById(req.user['id']);
        return user;
    }
    
    //fileIsRequired: false
    @UseGuards(AuthGuard('jwt-2fa'))
    @Post('me')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Req() req: Request,
        @Body('') dto: UpdateNameDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10000 }),
            ],
        })) avatar?: Express.Multer.File,
    ) {
        try {
            await this.userService.updateName(req.user['id'], dto.name);
        } catch {
            throw new HttpException(
                `Error: Username '${dto.name}' already exists`,
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
    async getProfile(@Param() dto: UsernameParamDto) {
        try {
            const user = await this.userService.getUserByName(dto.username);
            return user;
        } catch {
            throw new HttpException(`User '${dto.username}' not found`, HttpStatus.NOT_FOUND);
        }
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return await this.userService.getAllUserOrderedByElo();
    }

    @Get('history/:username')
    async getMatchHistory(@Param() dto: UsernameParamDto) {
        return await this.userService.getMatchHistoryByName(dto.username);
    }

    @Get('elo/general')
    async getEloDayGeneral(@Query() dto: DateDto) {
        return await this.userService.getAllPlayersEloByDate(dto.date);
    }

    @Get('elo/day/:username')
    async getEloDay(
        @Param() usernameDto: UsernameParamDto,
        @Query() dateDto: DateDto,
    ) {
        return await this.userService.getPlayerEloByDate(usernameDto.username, dateDto.date);
    }
}
