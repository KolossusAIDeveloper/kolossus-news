FROM node:18-alpine AS builder

WORKDIR /app

# Install backend deps
COPY package.json ./
RUN npm install --production=false

# Build React frontend
COPY client/package.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# --- Production stage ---
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY package.json ./
RUN npm install --only=production

COPY server.js ./

# Copy built frontend
COPY --from=builder /app/client/build ./client/build

EXPOSE 3000

CMD ["node", "server.js"]
