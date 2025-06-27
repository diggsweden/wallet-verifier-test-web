FROM node:22-bullseye-slim AS dependencies

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
RUN yarn install && yarn cache clean -f && yarn build

WORKDIR /dependencies
COPY ./wallet-enterprise/package.json ./wallet-enterprise/yarn.lock ./
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then yarn config set "strict-ssl" false -g; fi
RUN yarn install


FROM node:22-bullseye-slim AS development

ENV NODE_PATH=/node_modules
COPY --from=dependencies /dependencies/node_modules /node_modules

WORKDIR /app
ENV NODE_ENV=development
EXPOSE 8003
CMD ["yarn", "dev-docker"]

# Set user last so everything is readonly by default
USER node

# Don't need the rest of the sources since they'll be mounted from host