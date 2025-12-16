# Production-ready image for TrajetCount-backend
FROM node:20-alpine

WORKDIR /app

# Install dependencies first to leverage Docker layer cache
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Environment defaults (override in runtime/compose as needed)
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGO_PATH=mongodb://test:test@mongo:27017/trajet?authSource=admin

EXPOSE 3000

CMD ["node", "src/server.js"]
