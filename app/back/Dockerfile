FROM node:lts-alpine3.16

RUN apk add --no-cache curl

RUN npm install -g pnpm

COPY --chmod=0755 ./entrypoint.sh /entrypoint.sh

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
