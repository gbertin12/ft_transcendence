import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PunishmentsService } from './punishments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('punishments')
export class PunishmentsController {
	constructor(private readonly punishmentsService: PunishmentsService) { }

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('bans')
	async getBans(@Req() req) {
		return await this.punishmentsService.getBans(req.user);
	}
}
