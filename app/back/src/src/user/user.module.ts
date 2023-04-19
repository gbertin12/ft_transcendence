import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [DbModule],
    exports: [UserService],
})
export class UserModule {}
