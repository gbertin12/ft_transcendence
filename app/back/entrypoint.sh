#!/bin/sh

# TODO: check if DB already exists before running the migration
# DB should be in a volume for persistance
npx prisma db push --accept-data-loss
npm run start:dev
