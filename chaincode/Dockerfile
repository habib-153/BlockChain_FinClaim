FROM node:20 AS builder

WORKDIR /usr/src/app

COPY --chown=node:node . /usr/src/app
ENV npm_config_cache=/usr/src/app
RUN npm ci && npm run package


FROM node:20 AS production
ARG CC_SERVER_PORT

ENV TINI_VERSION v0.19.0
ENV PLATFORM=amd64
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-${PLATFORM} /tini
RUN chmod +x /tini

WORKDIR /usr/src/app
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=builder /usr/src/app/package.json ./
COPY --chown=node:node --from=builder /usr/src/app/npm-shrinkwrap.json ./
COPY --chown=node:node docker/docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh

RUN npm ci --omit=dev && npm cache clean --force && chmod +x /usr/src/app/docker-entrypoint.sh

ENV PORT $CC_SERVER_PORT
EXPOSE $CC_SERVER_PORT
ENV NODE_ENV=production

USER node
ENTRYPOINT [ "/tini", "--", "/usr/src/app/docker-entrypoint.sh" ]
