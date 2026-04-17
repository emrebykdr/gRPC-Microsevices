FROM node:18-bullseye

# Install protoc and protoc-gen-grpc-web
RUN apt-get update && apt-get install -y wget unzip
RUN wget https://github.com/protocolbuffers/protobuf/releases/download/v3.20.3/protoc-3.20.3-linux-x86_64.zip && \
    unzip protoc-3.20.3-linux-x86_64.zip -d /usr/local
RUN wget https://github.com/grpc/grpc-web/releases/download/1.5.0/protoc-gen-grpc-web-1.5.0-linux-x86_64 && \
    chmod +x protoc-gen-grpc-web-1.5.0-linux-x86_64 && \
    mv protoc-gen-grpc-web-1.5.0-linux-x86_64 /usr/local/bin/protoc-gen-grpc-web

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
COPY proto /proto

# Generate stubs
RUN mkdir -p generated
RUN protoc -I=/proto /proto/order.proto /proto/inventory.proto /proto/notification.proto \
    --js_out=import_style=commonjs,binary:./generated \
    --grpc-web_out=import_style=commonjs,mode=grpcwebtext:./generated

# Build step
RUN npx webpack --entry ./client.js --output-path ./dist --output-filename main.js --mode development

CMD ["npx", "http-server", "-p", "8081", "./dist"]
