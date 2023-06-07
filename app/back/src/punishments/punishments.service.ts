import { HttpException, Injectable } from '@nestjs/common';
import { Punishment } from '@prisma/client';
import { DbService } from 'db/db.service';
import { PowerAction } from 'interfaces/chat.interfaces';

export function parseActionType(action: PowerAction): number {
    switch (action) {
        case 'banned':
            return 0;
        case 'muted':
            return 1;
        case 'kicked':
            return 2;
        default:
            return -1;
    }
}

@Injectable()
export class PunishmentsService {
    constructor(
        private db: DbService,
    ) { }


    async applyPunishment(punished: number, punisher: number, channel: number, duration: number, punishment: PowerAction) {
        let punishment_type: number = parseActionType(punishment);
        if (punishment_type < 0) {
            throw new HttpException('Invalid punishment type', 400);
        }
        let expiration_date: Date = new Date();
        if (duration > 0) {
            expiration_date = new Date(Date.now() + duration);
        } else {
            expiration_date = new Date(2038, 0, 1, 0, 0, 0, 0);
        }
        // TODO: Check if the user already has a punishment of the same type, if so, update it to the new expiration date
        return await this.db.punishment.create({
            data: {
                punished_id: punished,
                issuer_id: punisher,
                channel_id: channel,
                expires_at: expiration_date,
                type: punishment_type
            }
        });
    }

    async getActivePunishments(channelId: number, userId: number, type: PowerAction, max: number = -1): Promise<Punishment[]> {
        let punishment_type: number = parseActionType(type);
        if (punishment_type < 0) {
            throw new HttpException('Invalid punishment type', 400);
        }
        return await this.db.punishment.findMany({
            where: {
                punished_id: userId,
                channel_id: channelId,
                type: punishment_type,
                expires_at: {
                    gt: new Date()
                }
            },
            orderBy: {
                expires_at: 'asc'
            },
            take: (max > 0 ? max : null)
        });
    }
}
