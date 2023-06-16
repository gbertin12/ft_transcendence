import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DbService } from '../db/db.service';

const fs = require('fs');
const http = require('node:https');

function generateRandomString(len: number) {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    const randomArray = Array.from(
        { length: len },
        (_, __) => chars[Math.floor(Math.random() * chars.length)]
    );

    const randomString = randomArray.join('');
    return randomString;
};

/**
 * @returns path to an AI generated avatar from pepe.mana.rip, defaults to default.jpg
 */
async function getPepeAvatar(): Promise<string> {
    try {
        const randomPepe = generateRandomString(24) + ".png";
        const file = fs.createWriteStream("files/static/avatars/" + randomPepe);
        let fileValid = true;
        http.get("https://pepe.mana.rip", function(response) {
            if (response.statusCode === 200) {
                response.pipe(file);
            } else {
                fileValid = false;
            }
        });
        return fileValid ? randomPepe : 'default.jpg';
    } catch (error) {
        console.log(error);
        return 'default.jpg';
    }
}
@Injectable()
export class UserService {
    constructor(private db: DbService) {}

    async getUserById(id: number) {
        const user = await this.db.user.findUnique({
            where: { id },
            select : {
                id: true,
                name: true,
                avatar: true,
                wins: true,
                losses: true,
                elo: true,
                otp: true,
            },
        });
        return user;
    }

    async getUserByName(name: string) {
        const user = await this.db.user.findUniqueOrThrow({
            where: { name },
            select : {
                id: true,
                name: true,
                avatar: true,
                wins: true,
                losses: true,
                elo: true,
                otp: true,
            },
        });
        return user;
    }

    async getUserByIdFull(id: number) {
        const user = await this.db.user.findUnique({
            where: { id },
        });
        return user;
    }

    async getUserByNameFull(name: string) {
        const user = await this.db.user.findUniqueOrThrow({
            where: { name },
        });
        return user;
    }

    async updateName(id: number, name: string) {
        await this.db.user.update({
            data: { name },
            where: { id },
        });
    }

    async updateAvatar(id: number, filename: string) {
        await this.db.user.update({
            data: { avatar: filename },
            where: { id },
        });
    }

    async getAllUserOrderedByElo() {
        return await this.db.user.findMany({
            orderBy: {
                elo:'desc'
            },
            select : {
                id: true,
                name: true,
                avatar: true,
                wins: true,
                losses: true,
                elo: true,
                otp: true,
            },
        });
    }

    async getOTPSecretById(id: number): Promise<string> {
        const user = await this.db.user.findUnique({
            where: { id },
            select: { otpSecret: true },
        });
        return user.otpSecret;
    }

    async updateOTPSecret(id: number, otpSecret: string) {
        // can't use update because it only wants unique fields on the 'where'
        if (otpSecret) {
            await this.db.user.updateMany({
                data: { otp: true, otpSecret },
                where: { id, otp: false },
            });
        } else {
            await this.db.user.updateMany({
                data: { otp: false, otpSecret: null },
                where: { id, otp: true },
            });
        }
    }

    // create a new user if it doesn't already exist
    async createUser(name: string, password: string = null): Promise<User> {
        let avatarPath: string = await getPepeAvatar();
        console.log(avatarPath)
        const user = await this.db.user.upsert({
            where: { name },
            update: {},
            create: { name, password, avatar: avatarPath },
        });
        return user;
    }

    async createDummyUser(): Promise<User> {
        let avatarPath: string = await getPepeAvatar();
        const name = generateRandomString(8);
        const password = 'password';
        const user = await this.db.user.upsert({
            where: { name },
            update: {},
            create: { name, password, avatar: avatarPath },
        });
        return user;
    }

    async incrementWin(name: string) {
        await this.db.user.update({
            data: {
                wins: { increment: 1 }
            },
            where: { name },
        });
    }

    async incrementLoose(name: string) {
        await this.db.user.update({
            data: {
                losses: { increment: 1 }
            },
            where: { name },
        });
    }

    async updateElo(name: string, elo: number) {
        await this.db.user.update({
            data : { elo },
            where: { name },
        });
    }

    async getMatchHistoryById(id: number) {
        const playerMatchHistory = await this.db.user.findUnique({
            where: { id },
            include: {
                gamesWon: {
                    include: {
                        looser: {
                            select: {
                                name: true,
                                avatar: true,
                                elo: true,
                            }
                        }
                    },
                },
                gamesLost: {
                    include: {
                        winner: {
                            select: {
                                name: true,
                                avatar: true,
                                elo: true,
                            }
                        }
                    }
                }
            }
        });

        // ugly workaround
        delete playerMatchHistory.password;
        delete playerMatchHistory.otpSecret;
        delete playerMatchHistory.otp;
        return playerMatchHistory;
    }

    async getMatchHistoryByName(name: string) {
        const playerMatchHistory = await this.db.user.findUnique({
            where: { name },
            include: {
                gamesWon: {
                    include: {
                        looser: {
                            select: {
                                name: true,
                                avatar: true,
                            }
                        },
                    },
                    orderBy: {
                        date: 'desc',
                    },
                },
                gamesLost: {
                    include: {
                        winner: {
                            select: {
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        date: 'desc',
                    },
                }
            },
        });

        // ugly workaround
        delete playerMatchHistory.password;
        delete playerMatchHistory.otpSecret;
        delete playerMatchHistory.otp;
        return playerMatchHistory;
    }

    async getAllPlayersEloByDate(date: Date) {
        const ret = await this.db.user.findMany({
            include: {
                gamesWon: {
                    where: {
                        date: { lte: date }
                    },
                    orderBy: {
                        id: 'desc',
                    },
                    take: 1
                },
                gamesLost: {
                    where: {
                        date: { lte: date }
                    },
                    orderBy: {
                        id: 'desc',
                    },
                    take: 1
                }
            },
        });

        let eloAll = 0;
        for (let i = 0; i < ret.length; i++) {
            if (!ret[i].gamesWon.length && !ret[i].gamesLost.length) {
                eloAll += 1000;
            } else if (ret[i].gamesWon.length && !ret[i].gamesLost.length) {
                eloAll += ret[i].gamesWon[0].winnerElo;
            } else if (ret[i].gamesLost.length && !ret[i].gamesWon.length) {
                eloAll += ret[i].gamesLost[0].looserElo;
            } else if (ret[i].gamesWon[0].id > ret[i].gamesLost[0].id) {
                eloAll += ret[i].gamesWon[0].winnerElo;
            } else {
                eloAll += ret[i].gamesLost[0].looserElo;
            }
        }

        return Math.round(eloAll / ret.length);
    }

    async getPlayerEloByDate(name: string, date: Date) {
        const ret = await this.db.user.findUnique({
            where: { name },
            include: {
                gamesWon: {
                    where: {
                        date: { lte: date }
                    },
                    orderBy: {
                        id: 'desc',
                    },
                    take: 1
                },
                gamesLost: {
                    where: {
                        date: { lte: date }
                    },
                    orderBy: {
                        id: 'desc',
                    },
                    take: 1
                }
            },
        });

        if (!ret.gamesWon.length && !ret.gamesLost.length) {
            return 1000;
        } else if (ret.gamesWon.length && !ret.gamesLost.length) {
            return ret.gamesWon[0].winnerElo;
        } else if (ret.gamesLost.length && !ret.gamesWon.length) {
            return ret.gamesLost[0].looserElo;
        } else if (ret.gamesWon[0].id > ret.gamesLost[0].id) {
            return ret.gamesWon[0].winnerElo;
        } else {
            return ret.gamesLost[0].looserElo;
        }
    }

    async addGame(
        winnerId: number,
        winnerScore: number,
        looserId: number,
        looserScore: number,
        eloDiff: number,
        winnerElo: number,
        looserElo: number,
        mode: boolean
    ) {
        await this.db.matchHistory.create({
            data: {
                winnerId,
                winnerScore,
                looserId,
                looserScore,
                eloDiff, 
                winnerElo,
                looserElo,
                mode
            }
        });
    }
}
