import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PongGateway } from './pong.gateway';

@Module({
    providers: [PongGateway],
    imports: [UserModule],
})
export class PongModule {}
