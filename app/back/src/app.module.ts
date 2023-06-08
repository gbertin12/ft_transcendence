import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { UserModule } from './user/user.module';
import { PongModule } from './pong/pong.module';
import { ChatModule } from './chat/chat.module';
import { PunishmentsModule } from './punishments/punishments.module';
import { DatasModule } from './datas/datas.module';

@Module({
    imports: [AuthModule, DbModule, UserModule, PongModule, ChatModule, PunishmentsModule, DatasModule],
})

export class AppModule {}
