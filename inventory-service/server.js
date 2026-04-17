const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { HealthImplementation } = require('grpc-health-check');
const { ReflectionService } = require('@grpc/reflection');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/inventory.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const inventoryProto = grpc.loadPackageDefinition(packageDefinition).inventory;

const stockMap = new Map([
  ["PROD-001", { name: "Laptop", quantity: 50, price: 999.99 }],
  ["PROD-002", { name: "Mouse", quantity: 200, price: 29.99 }],
  ["PROD-003", { name: "Keyboard", quantity: 0, price: 79.99 }],
]);

function CheckStock(call, callback) {
  const { product_id } = call.request;
  const product = stockMap.get(product_id);

  if (!product) {
    return callback(null, {
      product_id: product_id,
      available_quantity: 0,
      in_stock: false
    });
  }

  callback(null, {
    product_id: product_id,
    available_quantity: product.quantity,
    in_stock: product.quantity > 0
  });
}

function ReduceStock(call, callback) {
  const { product_id, quantity } = call.request;
  const product = stockMap.get(product_id);

  if (!product) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Ürün bulunamadı: ${product_id}`
    });
  }

  if (product.quantity < quantity) {
    return callback({
      code: grpc.status.FAILED_PRECONDITION,
      message: `Yetersiz stok: ${product_id} için ${quantity} adet gerekli, mevcut: ${product.quantity}`
    });
  }

  product.quantity -= quantity;
  callback(null, {
    success: true,
    message: "Stok güncellendi",
    remaining_stock: product.quantity
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(inventoryProto.InventoryService.service, { CheckStock, ReduceStock });

  const healthImpl = new HealthImplementation({
    "inventory.InventoryService": "SERVING",
    "": "SERVING",
  });
  healthImpl.addToServer(server);

  const reflection = new ReflectionService(packageDefinition);
  reflection.addToServer(server);

  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Inventory Service started on port 50052");
    server.start();
  });
}

main();
