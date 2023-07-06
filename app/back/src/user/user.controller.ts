/* eslint-disable prettier/prettier */
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
import { IsISO8601, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { PongGateway } from '../pong/pong.gateway';

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

class UserIdDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    id: number
}

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private pongGateway: PongGateway,
    ) {}

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('me')
    async me(@Req() req: Request) {
        const user: any = await this.userService.getUserById(req.user['id'], true);
        user['password'] = (user['password'] !== null ? '' : null);
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
    // http://localhost:8000/?next=/game?roomName=aa627a88-972e-42d0-b3af-789e670b77c3&who=0&nameOpponentPnuUPdmP

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

    @UseGuards(AuthGuard('jwt-2fa'))
    @Get('player/opponent')
    getOpponent(@Req() req: Request) {
        const current_player = this.pongGateway.players.find((p) => p.userId === req.user["id"]);
        const opponentId = this.pongGateway.duelRequests[current_player.id];
        if (!opponentId) {
            return null;
        }
        return opponentId;
    }

    @Get('player/:id')
    getPlayerById(@Param() dto: UserIdDto) {
        const player = this.pongGateway.players.find((p) => p.userId === dto.id);
        return player;
    }
}
