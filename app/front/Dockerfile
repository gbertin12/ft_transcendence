FROM node:lts

COPY --chmod=0755 ./entrypoint.sh /entrypoint.sh

WORKDIR /app

#ENTRYPOINT ["/entrypoint.sh"]
ENTRYPOINT ["npm", "run", "dev"]
