import { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker';
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
    await prisma.user.createMany({
        data: [
            {
                name: "test",
                password: sha512("test"),
            },
            {
                name: "user",
                password: sha512("user"),
            },
            {
                name: "gbertin",
                password: sha512("user"),
                elo: 1200,
                wins: 72,
                losses: 67
            },
            {
                name: "batiste",
                password: sha512("user"),
                elo: 1300,
                wins: 90,
                losses: 67
            },
            {
                name: "top1ouRien",
                password: sha512("user"),
                elo: 1800,
                wins: 120,
                losses: 67
            },
        ]
    });
}

async function seedMatchHistory() {
    await prisma.matchHistory.createMany({
        data: [
            { winnerId: 1, winnerScore: 10, winnerElo: 1000, looserId: 2, looserScore: 3, looserElo: 1000, eloDiff: 0},            
            { winnerId: 2, winnerScore: 10, winnerElo: 1020,looserId: 1, looserScore: 1, looserElo: 353, eloDiff: 0},            
            { winnerId: 4, winnerScore: 10, winnerElo: 1200, looserId: 1, looserScore: 2, looserElo: 999, eloDiff: 0},            
        ]
    });
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

async function main() {
    // reset all tables
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Channel", "Message" RESTART IDENTITY CASCADE`;

    await seedUsers();
    await seedChannels();
    await seedMessages();
    await seedMatchHistory();

    // update sequences
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "User"`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Channel"', 'id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "Channel"`;
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Message"', 'message_id'), coalesce(max("message_id"), 1), max("message_id") IS NOT null) FROM "Message"`;
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
