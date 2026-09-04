# Stage 1: Build the client
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy server dependencies and built code
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=server-builder /app/server/dist ./dist

# Copy client static assets into where server serves them
COPY --from=client-builder /app/client/dist /app/client/dist

# Persistent data directory for rooms
RUN mkdir -p /app/data
VOLUME /app/data

EXPOSE 4000

CMD ["node", "dist/server.js"]
