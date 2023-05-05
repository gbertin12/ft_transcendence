#!/bin/sh

# TODO: check if DB already exists before running the migration
# DB should be in a volume for persistance
npx prisma migrate dev --name init
npx prisma db push
npm run start:dev
