import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbService } from './db.service';

@Global()
@Module({
    providers: [DbService],
    exports: [DbService],
    imports: [ConfigModule]
})
export class DbModule {}
