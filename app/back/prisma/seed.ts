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
                password: isPasswordProtected ? sha512(faker.internet.password()) : "",
            };
        case 1: // long
            return {
                name: faker.word.noun() + "-" + faker.word.noun(),
                topic: faker.lorem.words(8),
                private: isPrivate,
                creation_date: faker.date.past().toISOString(),
                owner_id: 2,
                password: isPasswordProtected ? sha512(faker.internet.password()) : "",
            };
        default:
            throw new Error("Invalid size");
    }
}

async function seedUsers() {
    await prisma.user.createMany({
        data: [
            {
                username: "test",
                password: sha512("test"),
                role: "?"
            },
            {
                username: "user",
                password: sha512("user"),
                role: "user"
            },
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

async function main() {
    // reset all tables
    await prisma.$executeRaw`TRUNCATE TABLE "User", "Channel", "Message" RESTART IDENTITY CASCADE`;

    await seedUsers();
    await seedChannels();
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
