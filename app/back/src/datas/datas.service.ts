import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { Message } from '@prisma/client';
import { ChannelStaff } from '../interfaces/chat.interfaces';

export interface HourlyEntry {
    usersCount: number;
    adminCount: number;
    ownerCount: number;
    hour: number;
}

@Injectable()
export class DatasService {
    constructor(
        private dbService: DbService
    ) { }

    async getHourlyMessages(channel_id: number, max_hours: number = 12, staff: ChannelStaff) {
        if (max_hours > 24 || max_hours <= 0) {
            throw new HttpException("max_hours must be between 1 and 24", 400);
        }
        let messages = await this.dbService.message.findMany({
            where: {
                AND: [
                    {
                        channel_id: channel_id,
                    },
                    {
                        timestamp: {
                            gte: new Date(Date.now() - (max_hours * 60 * 60 * 1000))
                        }
                    }
                ]
            },
            select: {
                timestamp: true,
                sender_id: true
            }
        });
        const max = new Date();
        const min = new Date(max.getTime() - (max_hours * 60 * 60 * 1000));
        let hourlyMessages: HourlyEntry[] = [];
        for (let i = 0; i <= max_hours; i++) {
            const hour = new Date(min.getTime() + (i * 60 * 60 * 1000));
            hourlyMessages.push({
                usersCount: 0,
                adminCount: 0,
                ownerCount: 0,
                hour: hour.getHours()
            });
        }
        messages.forEach((message: Message) => {
            const hour = message.timestamp.getHours();
            const index = hourlyMessages.findIndex((entry: HourlyEntry) => entry.hour === hour);
            if (index !== -1) {
                if (message.sender_id === staff.owner_id) {
                    hourlyMessages[index].ownerCount++;
                } else if (staff.administrators.includes(message.sender_id)) {
                    hourlyMessages[index].adminCount++;
                } else {
                    hourlyMessages[index].usersCount++;
                }
            }
        });
        return hourlyMessages;
    }
}
