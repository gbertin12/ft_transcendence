import { HttpException, HttpStatus, Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DbModule } from '../db/db.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { PongModule } from '../pong/pong.module';

const storage = diskStorage({
    destination: process.env.AVATAR_DIR,
    filename: function(_req, _file, cb) {
        const uuid = randomUUID();
        cb(null, uuid + '.jpg');
    }
});

const fileFilter = (
    _req: any,
    file: any,
    callback: (error: Error, acceptFile: boolean) => any,
) => {
    if (!file.originalname.match(/\.(png|jpe?g|gif|webp)$/)) {
        callback(
            new HttpException("Error: only images are allowed (size must be under 10kB)", HttpStatus.BAD_REQUEST),
            false,
        );
    }
    callback(null, true);
};

@Module({
    controllers: [UserController],
    providers: [UserService],
    imports: [
        DbModule,
        forwardRef(() => PongModule),
        MulterModule.register({
            storage,
            fileFilter,
        }),
    ],
    exports: [UserService],
})
export class UserModule {}
