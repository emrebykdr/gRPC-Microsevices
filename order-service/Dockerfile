FROM node:18-alpine
WORKDIR /app
COPY order-service/package*.json ./
RUN npm ci --only=production
COPY proto /proto
COPY order-service/ .
EXPOSE 50051
CMD ["node", "server.js"]
