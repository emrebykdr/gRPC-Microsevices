FROM node:18-alpine
WORKDIR /app
COPY inventory-service/package*.json ./
RUN npm ci --only=production
COPY proto /proto
COPY inventory-service/ .
EXPOSE 50052
CMD ["node", "server.js"]
