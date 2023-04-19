import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DbModule } from 'src/db/db.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [DbModule, MulterModule.register({ dest: '/app/static/avatars' })],
    exports: [UserService],
})
export class UserModule {}
