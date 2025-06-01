FROM --platform=$BUILDPLATFORM node:22.14 AS build

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run auth:build

ENV NODE_ENV=production

RUN rm -rf node_modules && \
    mv prisma dist/dma-as/prisma/ && \
    cd dist/apps/auth && \
    npm i && \
    npx prisma generate


FROM node:22.14-alpine3.21

WORKDIR /app

COPY --from=build /app/dist/apps/auth .

LABEL org.opencontainers.image.source=https://github.com/dnd-mapp/dma-as
LABEL org.opencontainers.image.description="Image containing the DnD-Mapp Authentication Server"
LABEL org.opencontainers.image.licenses=AGPL-3.0-only

CMD ["node", "main.js"]
