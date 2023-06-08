import { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/fr';
import { sha512 } from 'js-sha512';

const prisma = new PrismaClient()


async function createFakeChannel(size: number, isPrivate: boolean = false, isPasswordProtected: boolean = false) {
    switch (size) {
        case 0: // short
            return {
                name: faker.word.noun(),
                topic: faker.lorem.words(4),
                private: isPrivate,
                creation_date: faker.date.past().toISOString(),
                owner_id: 1,
                password: isPasswordProtected ? sha512(faker.internet.password()) : null,
            };
        case 1: // long
            return {
                name: faker.word.noun() + "-" + faker.word.noun(),
                topic: faker.lorem.words(8),
                private: isPrivate,
                creation_date: faker.date.past().toISOString(),
                owner_id: 2,
                password: isPasswordProtected ? sha512(faker.internet.password()) : null,
            };
        default:
            throw new Error("Invalid size");
    }
}

let messageId = 0;

async function createFakeMessage(size: number, author_id: number, channel_id: number) {
    return {
        channel_id: channel_id,
        sender_id: author_id === 2 ? 1 : 2,
        message_id: messageId++,
        content: faker.lorem.words(size),
        timestamp: faker.date.past().toISOString()
    };
}

async function seedUsers() {
    const user_count: number = 10;
    const prefix = "batiste_";

    let users: Prisma.UserCreateManyInput[] = [];
    for (let i = 0; i < user_count; i++) {
        users.push({
            name: prefix + faker.word.noun() + "_" + faker.word.adjective(),
            password: sha512(faker.internet.password()),
            elo: Math.floor(Math.random() * 1500) + 500,
            wins: 0,
            losses: 0
        });
    }
    await prisma.user.createMany({
        data: users
    });
}

function calcElo(eloWinner: number, eloLooser: number, scoreWinner: number, scoreLooser: number) {
    const p1 = eloWinner / (eloWinner + eloLooser);
    const p2 = eloLooser / (eloWinner + eloLooser);
    const k = 42 * (scoreWinner - scoreLooser);

    eloWinner = eloWinner + k * (1 - p1);
    eloLooser = eloLooser + k * (0 - p2);
    
    // prevent elo from reaching 0 or less
    if (eloLooser <= 0) eloLooser = 1;


    return [ Math.round(eloWinner), Math.round(eloLooser) ];
}

async function seedMatchHistory() {
    const users = await prisma.user.findMany();
    const game_count = 30;
    const startDate = new Date();

    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    let games: Prisma.MatchHistoryCreateManyInput[] = [];

    let total: number = 0;

    // iterate once to count total number of games
    for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < users.length; j++) {
            for (let k = 0; k < game_count; k++) {
                if (i === j) continue; // skip self fights
                total++;
            }
        }
    }

    for (let k = 0; k < game_count; k++) {
        for (let j = 0; j < users.length; j++) {
            for (let i = 0; i < users.length; i++) {
                if (i === j) continue; // skip self fights
                const winner = Math.random() < 0.5 ? users[i] : users[j];
                const looser = winner === users[i] ? users[j] : users[i];
                const winnerScore = 10;
                const looserScore = Math.floor(Math.random() * 10);
                const newElo = calcElo(winner.elo, looser.elo, winnerScore, looserScore);
                const winnerElo = newElo[0];
                const looserElo = newElo[1];
                const eloDiff = Math.floor(Math.random() * 25) + 5;
                const currentDate = new Date();
                currentDate.setDate(startDate.getDate() - 30 + k);
                currentDate.setHours(0);
                currentDate.setSeconds(0);
                currentDate.setMilliseconds(0);
                console.log(currentDate);
                games.push({
                    winnerId: winner.id,
                    winnerScore: winnerScore,
                    winnerElo: winnerElo,
                    looserId: looser.id,
                    date: currentDate,
                    looserScore: looserScore,
                    looserElo: looserElo,
                    eloDiff: eloDiff
                });
            }
            total -= games.length;
            if (total % 10000 === 0) {
                console.log(total + " games left to generate");
            }
            await prisma.matchHistory.createMany({
                data: games
            });
            games = [];
        }
    }
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const wins = await prisma.matchHistory.count({
            where: {
                winnerId: user.id
            }
        });
        const losses = await prisma.matchHistory.count({
            where: {
                looserId: user.id
            }
        });
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                wins: wins,
                losses: losses
            }
        });
    }
}

async function seedChannels() {
    await prisma.channel.createMany({
        data: [
            await createFakeChannel(0, false, false),
            await createFakeChannel(1, false, false),
            await createFakeChannel(0, true, false),
            await createFakeChannel(1, true, false),
            await createFakeChannel(0, false, true),
            await createFakeChannel(1, false, true)
        ]
    });
}

async function seedMessages() {
    // create 100 messages (max 2000 length) for each channel
    for (let i = 1; i <= 6; i++) {
        let messages: Prisma.MessageCreateManyInput[] = [];
        for (let j = 0; j < 100; j++) {
            messages.push(
                await createFakeMessage(
                    Math.floor(Math.random() * 20),
                    Math.floor(Math.random() * 2) + 1, i
                )
            );
        }
        await prisma.message.createMany({
            data: messages
        });
    }
}

async function seedFriends() {
    await prisma.friend.createMany({
        data: [
            {
                user_id: 1,
                friend_id: 1,
            },
        ],
    });
}

async function main() {
    // reset all tables
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Channel", "Message", "MatchHistory" RESTART IDENTITY CASCADE`;

    await seedUsers();
    await seedChannels();
    await seedMessages();
    await seedMatchHistory();

    // update sequences
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "User"`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Channel"', 'id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "Channel"`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Message"', 'message_id'), coalesce(max("message_id"), 1), max("message_id") IS NOT null) FROM "Message"`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"MatchHistory"', 'id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "MatchHistory"`;
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
