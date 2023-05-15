import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { GameService } from './game.service';
import { PongGateway } from './pong.gateway';

@Module({
    providers: [PongGateway, GameService],
    imports: [UserModule],
})
export class PongModule {}
