import { Controller } from '@nestjs/common';
import { PunishmentsService } from './punishments.service';

@Controller('punishments')
export class PunishmentsController {
	constructor(private readonly punishmentsService: PunishmentsService) { }

	
}
