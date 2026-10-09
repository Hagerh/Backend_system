FROM node:22-alpine
WORKDIR /app

# Dependencies first: this layer is cached until package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
USER node
EXPOSE 3000

# Default: the API. The consumer overrides this command in docker-compose.yml.
CMD ["node", "src/server.js"]
