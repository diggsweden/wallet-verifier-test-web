FROM node:22-bullseye-slim AS builder

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NPM_STRICT_SSL=true

ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

WORKDIR /dependencies

RUN apt-get update && apt-get install -y git

# Install dependencies first so rebuild of these layers is only needed when dependencies change
COPY lib/ ./lib/

WORKDIR /dependencies/lib/wallet-common
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then yarn config set "strict-ssl" false -g; fi
RUN yarn install && yarn cache clean -f && yarn build && mkdir -p /app/lib && mv /dependencies/lib/wallet-common /app/lib/wallet-common

WORKDIR /app
COPY wallet-enterprise/ .

RUN rm -rf /app/src/configuration/
COPY ./wallet-enterprise-configurations/issuer/src/configuration/ src/configuration/
COPY ./wallet-enterprise-configurations/issuer/public/styles/main.css public/styles/main.css
COPY ./wallet-enterprise-configurations/issuer/public/images/ public/images/

RUN if [ "$NPM_STRICT_SSL" = "false" ]; then yarn config set "strict-ssl" false -g; fi
RUN yarn cache clean && yarn install && yarn build && rm -rf node_modules/ && yarn install --production

# Production stage
FROM node:22-bullseye-slim AS production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib/wallet-common/ ./lib/wallet-common/
COPY --from=builder /app/package.json .
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/views/ ./views/

ENV NODE_ENV=production
EXPOSE 8003

CMD ["node", "./dist/src/app.js"]