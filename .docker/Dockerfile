FROM --platform=$BUILDPLATFORM node:22.14 AS build

WORKDIR /app

COPY package*.json .

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

ENV NODE_ENV=production

RUN mv node_modules/.prisma prisma-client/ && \
    cd dist/dma-as && \
    npm i && \
    mv ../../prisma-client node_modules/.prisma/


FROM node:22.14-alpine3.21

WORKDIR /app

COPY --from=build /app/dist/dma-as .

LABEL org.opencontainers.image.source=https://github.com/dnd-mapp/dma-as
LABEL org.opencontainers.image.description="Image containing the DnD-Mapp Authentication Server"
LABEL org.opencontainers.image.licenses=AGPL-3.0-only

CMD ["node", "main.js"]
