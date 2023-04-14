// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { DbService } from 'src/db/db.service';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient()

function createFakeChannel(size: number) {
    switch (size) {
        case 0: // short
            return {
                title: faker.word.noun(),
                topic: faker.lorem.words(10),
            };
        case 1: // long
            return {
                title: faker.word.noun() + "-" + faker.word.noun(),
                topic: faker.lorem.words(21),
            };
        default:
            throw new Error("Invalid size");
    }
}

async function main() {
    console.log("Creating fake channels with short names (15)");
    for (let i = 0; i < 15; i++) {
        await prisma.channel.create({
            data: createFakeChannel(0),
        })
    }
    console.log("Creating fake channels with long names (15)");
    for (let i = 0; i < 15; i++) {
        await prisma.channel.create({
            data: createFakeChannel(1),
        })
    }

}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })