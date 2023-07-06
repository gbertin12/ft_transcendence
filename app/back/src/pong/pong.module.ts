import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { GameService } from './game.service';
import { PongGateway } from './pong.gateway';

@Module({
    providers: [PongGateway, GameService],
    imports: [forwardRef(() => UserModule)],
    exports: [PongGateway]
})
export class PongModule {}
