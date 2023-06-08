import { Controller, Get, HttpException, Param, Req, UseGuards } from '@nestjs/common';
import { DatasService } from './datas.service';
import { ChannelService } from '../channel/channel.service';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsPositive, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ChannelStaff } from '../interfaces/chat.interfaces';

class HourlyDto {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    id: number;

	@Type(() => Number)
	@IsNumber()
	@IsPositive()
	@Min(1)
	@Max(24)
	hours: number;
}

@Controller('datas')
export class DatasController {
	constructor(
		private readonly datasService: DatasService,
		private readonly channelService: ChannelService
	) { }

	@UseGuards(AuthGuard('jwt-2fa'))
	@Get('hourly_messages/:id/:hours')
	async getHourlyMessages(@Param() dto: HourlyDto, @Req() req) {
		let staff: ChannelStaff | null = null;
		try {
			staff = await this.channelService.getChannelStaff(dto.id);
		} catch (e) {
			throw new HttpException("Channel not found", 404)
		}
		if (!(staff.administrators.includes(req.user.id) || staff.owner_id === req.user.id)) {
			throw new HttpException("You are not allowed to use this endpoint", 403)
		}
		return await this.datasService.getHourlyMessages(dto.id, dto.hours, staff);
	}
}
