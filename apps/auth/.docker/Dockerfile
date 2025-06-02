FROM --platform=$BUILDPLATFORM node:22.14 AS build

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npx nx build auth && \
    # Temporarily move the generated Prisma client outside of the node_modules
    mkdir tmp && \
    cp -r node_modules/.prisma tmp/prisma && \
    # Remove node_modules to prevent caching issues
    rm -rf node_modules && \
    cd dist/apps/auth && \
    # Install production only dependencies
    npm ci && \
    # Add back the previously generated Prisma client into the output bundle
    cp -r /app/tmp/prisma node_modules/.prisma


FROM node:22.14-alpine3.21

WORKDIR /app

COPY --from=build /app/dist/apps/auth .

LABEL org.opencontainers.image.source=https://github.com/dnd-mapp/dma-as
LABEL org.opencontainers.image.description="Image containing the DnD-Mapp Authentication Server"
LABEL org.opencontainers.image.licenses=AGPL-3.0-only

CMD ["node", "main.js"]
