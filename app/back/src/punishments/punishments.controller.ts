import { Body, Controller, Delete, Get, NotFoundException, Param, Req, UseGuards } from '@nestjs/common';
import { PunishmentsService } from './punishments.service';
import { AuthGuard } from '@nestjs/passport';
import ChatGateway from '../chat/chat.gateway';
import { ChannelService } from '../channel/channel.service';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

class RevokeDto {
	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	issuer_id: number;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	punished_id: number;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	channel_id: number;
}

@Controller('punishments')
export class PunishmentsController {
	constructor(
		private readonly punishmentsService: PunishmentsService,
		private readonly chatGateway: ChatGateway,
		private readonly channelService: ChannelService
	) { }

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('bans')
	async getBans(@Req() req) {
		return await this.punishmentsService.getBans(req.user);
	}

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('active')
	async getActivePunishments(@Req() req) {
		return await this.punishmentsService.getActivePunishments(req.user);
	}

	@UseGuards(AuthGuard('jwt-2fa'))
	@Delete('/:issuer_id/:punished_id/:channel_id')
	async deletePunishment(@Req() req, @Param() dto: RevokeDto) {
		const channel = await this.channelService.getChannel(dto.channel_id);
		if (!channel) {
			throw new NotFoundException("Channel not found");
		}
		// Check if revoker is admin / owner of the channel
		if (channel.owner_id !== req.user.id && !channel.admins.map(a => a.user_id).includes(req.user.id)) {
			throw new NotFoundException("Channel not found");
		}
		await this.punishmentsService.revoke(dto.issuer_id, dto.punished_id, dto.channel_id);
		// Send revoke to punished user
		if (this.chatGateway.usersClients[dto.punished_id]) {
			this.chatGateway.usersClients[dto.punished_id].emit('punishment_revoked', dto.channel_id);
		}
	}
}
