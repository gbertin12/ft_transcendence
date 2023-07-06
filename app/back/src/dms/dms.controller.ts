import { BadRequestException, Controller, ForbiddenException, Get, HttpException, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DmsService } from './dms.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';
import { UserService } from '../user/user.service';
import { FriendsService } from '../friends/friends.service';
import { AuthGuard } from '@nestjs/passport';
import ChatGateway from '../chat/chat.gateway';

class GenericUserIdDto {
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	id: number;
}

class HistoryDto {
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	interlocutor_id: number;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	last_message_id: number;
}

@Controller('dms')
export class DmsController {
	constructor(
		private readonly dmsService: DmsService,
		private readonly userService: UserService,
		private readonly friendsService: FriendsService,
		private readonly chatGateway: ChatGateway,
	) { }

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('/interlocutor/:id')
	async getInterlocutor(@Req() req, @Param() dto: GenericUserIdDto) {
		// Check if user are friends
		const requester_id = req.user.id;
		const interlocutor_id = dto.id;
		if (requester_id === interlocutor_id) {
			throw new BadRequestException("You can't be your own interlocutor");
		}
		const areFriends = await this.friendsService.areFriends(requester_id, interlocutor_id);
		if (!areFriends) {
			throw new ForbiddenException("Users are not friends");
		}
		// Get interlocutor and return it
		const interlocutor = await this.userService.getUserById(interlocutor_id);
		if (!interlocutor) {
			throw new NotFoundException("Could not find interlocutor");
		}
		return interlocutor;
	}

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('/:id/messages')
	async getDMMessages(@Req() req, @Param() dto: GenericUserIdDto) {
		const requester_id = req.user.id;
		const interlocutor_id = dto.id;
		const areFriends = await this.friendsService.areFriends(requester_id, interlocutor_id);
		if (!areFriends) {
			throw new ForbiddenException("Users are not friends");
		}
		return this.dmsService.getDMMessages(requester_id, interlocutor_id);
	}

	@UseGuards(AuthGuard('jwt-2fa'))
    @Get(':interlocutor_id/:last_message_id')
    async dmsHistory(@Param() dto: HistoryDto, @Req() req) {
        return await this.dmsService.getDmsHistory(req.user.id, dto.interlocutor_id, dto.last_message_id);
    }

	@UseGuards(AuthGuard('jwt-2fa'))
	@Post('/:id/message')
	async sendDMMessage(@Req() req, @Param() dto: GenericUserIdDto) {
		const requester_id = req.user.id;
		const interlocutor_id = dto.id;
		// Check if the interlocutor are friends, and if interlocutor or requester didn't block each other
		const areFriends = await this.friendsService.areFriends(requester_id, interlocutor_id);
		if (!areFriends) {
			throw new ForbiddenException("Users are not friends");
		}
		const isBlocked = await this.friendsService.isBlocked(requester_id, interlocutor_id);
		if (isBlocked) {
			throw new ForbiddenException("You are blocked by this user");
		}
		const isBlockedBy = await this.friendsService.isBlocked(interlocutor_id, requester_id);
		if (isBlockedBy) {
			throw new ForbiddenException("You blocked this user");
		}
		let message = await this.dmsService.createMessage(requester_id, interlocutor_id, req.body.content);
		this.chatGateway.server.to(`user-${interlocutor_id}`).emit('dmMessage', message);
		this.chatGateway.server.to(`user-${requester_id}`).emit('dmMessage', message);
	};
}
