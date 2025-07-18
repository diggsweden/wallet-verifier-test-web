FROM node:18-bullseye-slim

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG NODE_OPTIONS
ARG NODE_EXTRA_CA_CERTS

WORKDIR /app

COPY package*.json ./
COPY docker/proxy-cert.crt* ./

ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV NODE_OPTIONS=${NODE_OPTIONS}
ENV NODE_EXTRA_CA_CERTS=${NODE_EXTRA_CA_CERTS}

RUN echo "HTTP_PROXY=$HTTP_PROXY"
RUN echo "HTTPS_PROXY=$HTTPS_PROXY"
RUN echo "NO_PROXY=$NO_PROXY"
RUN echo "NODE_OPTIONS=$NODE_OPTIONS"
RUN echo "NODE_EXTRA_CA_CERTS=$NODE_EXTRA_CA_CERTS"

RUN npm ci

COPY layouts layouts
COPY pages pages
COPY public public
COPY server server
COPY app.vue nuxt.config.ts tsconfig.json ./

ENV HOST_API=http://eudi-verifier
RUN npm run build

RUN npm prune --omit=dev

EXPOSE 3002

CMD ["node", ".output/server/index.mjs"]
