import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DbModule } from 'src/db/db.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';

const storage = diskStorage({
    destination: process.env.AVATAR_DIR,
    filename: function(_req, _file, cb) {
        const uuid = randomUUID();
        cb(null, uuid + '.jpg');
    }
});

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        DbModule,
        MulterModule.register({
            storage
        }),
    ],
    exports: [UserService],
})
export class UserModule {}
