FROM node:16-bullseye-slim as dependencies

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NPM_STRICT_SSL=true
ARG NODE_TLS_REJECT_UNAUTHORIZED=true

ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}
ENV NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}

WORKDIR /dependencies

# Install dependencies first so rebuild of these layers is only needed when dependencies change
COPY package.json yarn.lock ./
RUN if [ "$NPM_STRICT_SSL" = "false" ]; then yarn config set "strict-ssl" false -g; fi
RUN yarn cache clean && yarn install


FROM node:16-bullseye-slim as development

ENV NODE_PATH=/node_modules
COPY --from=dependencies /dependencies/node_modules /node_modules

WORKDIR /app
ENV NODE_ENV=development
CMD ["yarn", "dev-docker"]

# Set user last so everything is readonly by default
USER node

# Don't need the rest of the sources since they'll be mounted from host
