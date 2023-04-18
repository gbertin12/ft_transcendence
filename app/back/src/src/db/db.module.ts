import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { UserService } from './user.service';

@Module({
    providers: [DbService, UserService],
    exports: [DbService, UserService],
})
export class DbModule {}
