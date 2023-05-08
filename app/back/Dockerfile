FROM node:lts-alpine3.16

RUN apk add --update curl

COPY --chmod=0755 entrypoint.sh /entrypoint.sh

WORKDIR /app

ENTRYPOINT ["/entrypoint.sh"]
