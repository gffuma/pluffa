FROM node:16.17.1-slim as builder

WORKDIR /app

ENV NODE_OPTIONS --max_old_space_size=4096

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY pluffa.config.mjs .
# COPY tsconfig.json .
COPY ./public ./public
COPY ./src ./src

RUN yarn build

FROM node:16.17.1-slim

WORKDIR /app

COPY --from=builder /app/.pluffa/standalone ./standalone
COPY ./public ./public

ENV NODE_ENV production

CMD ["node", "./standalone/server.mjs"]