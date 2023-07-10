#!/bin/sh

FLAG_FILE=.npm_modules_installed
if [ ! -f "$FLAG_FILE" ]; then
    pnpm install
    touch "$FLAG_FILE"
fi

npx prisma generate
npx prisma db push --accept-data-loss

exec npm run start
