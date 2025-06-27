FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV HOST_API=http://eudi-verifier
RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3002

CMD ["node", ".output/server/index.mjs"]