# --- Test stage ---
FROM node:26-alpine AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci          # keeps devDependencies (Jest, ts-jest, etc.)

COPY . .
RUN npx prisma generate
# CMD is provided by docker-compose


# Build stage
FROM node:26-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:26-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci

# Copy compiled app + prisma artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Generate client fresh in production environment
RUN npx prisma generate

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]