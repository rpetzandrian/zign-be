#Build stage
FROM node:alpine3.22 AS build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only-production

COPY ./ ./

RUN npm run build

RUN cp -a ./node_modules ./build

#Production stage
FROM node:alpine3.22 AS production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/build ./
COPY --from=build /app/prisma ./prisma/

EXPOSE 8080
CMD ["node", "."]
