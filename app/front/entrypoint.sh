#!/bin/sh

FLAG_FILE=.npm_modules_installed
if [ ! -f "$FLAG_FILE" ]; then
    pnpm install
    touch "$FLAG_FILE"
fi

# prod
npm run build && npm run start

#exec npm run dev
