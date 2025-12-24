#Build stage
FROM node:alpine3.22 AS build

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only-production

COPY ./ ./

RUN npm run build

RUN cp -a ./node_modules ./build
RUN cp -a ./src/data ./build/src/data/

#Production stage
FROM node:alpine3.22 AS production

ENV NODE_ENV=production

# Install Poppler
RUN apk add --no-cache \
    poppler-utils \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg

WORKDIR /app

COPY --from=build /app/build ./
COPY --from=build /app/prisma ./prisma/

EXPOSE 8080
CMD ["node", "."]
