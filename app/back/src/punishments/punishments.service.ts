import { HttpException, Injectable } from '@nestjs/common';
import { Punishment, User } from '@prisma/client';
import { DbService } from '../db/db.service';
import { PowerAction } from '../interfaces/chat.interfaces';

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

export function parseActionTypeToString(action: number): PowerAction {
    switch (action) {
        case 0:
            return 'banned';
        case 1:
            return 'muted';
        case 2:
            return 'kicked';
        default:
            throw new HttpException('Invalid action type', 400);
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
        return await this.db.punishment.upsert({
            where: {
                issuer_id_punished_id_channel_id: {
                    issuer_id: punisher,
                    punished_id: punished,
                    channel_id: channel
                }
            },
            update: {
                punished_id: punished,
                issuer_id: punisher,
                channel_id: channel,
                expires_at: expiration_date,
                type: punishment_type
            },
            create: {
                punished_id: punished,
                issuer_id: punisher,
                channel_id: channel,
                expires_at: expiration_date,
                type: punishment_type
            }
        });
    }

    async getActivePunishments(user: User): Promise<Record<any, any>> {
        return await this.db.punishment.findMany({
            where: {
                punished_id: user.id,
                expires_at: {
                    gt: new Date()
                }
            },
            orderBy: {
                expires_at: 'asc'
            },
            select: {
                type: true,
                channel_id: true,
                expires_at: true,
            }
        });
    }


    /**
     * Returns a list of channel ids in which the user is banned
     * @param user User to check
     */
    async getBans(user: User): Promise<number[]> {
        return await this.db.punishment.findMany({
            where: {
                punished_id: user.id,
                type: parseActionType('banned'),
                expires_at: {
                    gt: new Date()
                }
            },
            select: {
                channel_id: true
            }
        }).then((punishments: Punishment[]) => {
            return punishments.map((punishment: Punishment) => punishment.channel_id);
        });
    }

    async hasActiveBan(channelId: number, userId: number): Promise<boolean> {
        return await this.db.punishment.findFirst({
            where: {
                punished_id: userId,
                channel_id: channelId,
                type: parseActionType('banned'),
                expires_at: {
                    gt: new Date()
                }
            }
        }).then((punishment: Punishment) => {
            return punishment !== null;
        });
    }

    async hasActiveMute(channelId: number, userId: number): Promise<Punishment | null> {
        return await this.db.punishment.findFirst({
            where: {
                punished_id: userId,
                channel_id: channelId,
                type: parseActionType('muted'),
                expires_at: {
                    gt: new Date()
                }
            }
        });
    }
}
