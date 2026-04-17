const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { HealthImplementation } = require('grpc-health-check');
const { ReflectionService } = require('@grpc/reflection');
const path = require('path');
const express = require('express');

const ORDER_PROTO_PATH = path.join(__dirname, '../proto/order.proto');
const INVENTORY_PROTO_PATH = path.join(__dirname, '../proto/inventory.proto');
const NOTIFICATION_PROTO_PATH = path.join(__dirname, '../proto/notification.proto');

const protoOpts = { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true };

const orderPkgDef       = protoLoader.loadSync(ORDER_PROTO_PATH,        protoOpts);
const inventoryPkgDef   = protoLoader.loadSync(INVENTORY_PROTO_PATH,    protoOpts);
const notificationPkgDef = protoLoader.loadSync(NOTIFICATION_PROTO_PATH, protoOpts);

const orderProto        = grpc.loadPackageDefinition(orderPkgDef).order;
const inventoryProto    = grpc.loadPackageDefinition(inventoryPkgDef).inventory;
const notificationProto = grpc.loadPackageDefinition(notificationPkgDef).notification;

const INVENTORY_HOST = process.env.INVENTORY_HOST || 'localhost:50052';
const NOTIFICATION_HOST = process.env.NOTIFICATION_HOST || 'localhost:50053';

const inventoryClient = new inventoryProto.InventoryService(INVENTORY_HOST, grpc.credentials.createInsecure());
const notificationClient = new notificationProto.NotificationService(NOTIFICATION_HOST, grpc.credentials.createInsecure());

function CreateOrder(call, callback) {
  const { product_id, quantity, customer_id } = call.request;
  
  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + 5);

  inventoryClient.ReduceStock({ product_id, quantity }, { deadline }, (err, response) => {
    if (err) {
      if (err.code === grpc.status.DEADLINE_EXCEEDED) {
        console.error("[TIMEOUT] Inventory Service yanıt vermedi!");
      }

      notificationClient.SendNotification({
        customer_id,
        order_id: "",
        type: "OUT_OF_STOCK",
        message: err.message
      }, { deadline: new Date(Date.now() + 5000) }, () => {});

      return callback(err);
    }

    const order_id = `ORD-${Math.floor(Math.random() * 10000)}`;

    notificationClient.SendNotification({
      customer_id,
      order_id,
      type: "ORDER_CONFIRMED",
      message: `Sipariş onaylandı: ${order_id}`
    }, { deadline: new Date(Date.now() + 5000) }, () => {});

    callback(null, {
      order_id,
      status: "CONFIRMED",
      message: "Sipariş başarıyla oluşturuldu"
    });
  });
}

function TrackOrder(call) {
  const orderId = call.request.order_id;
  const statuses = ["RECEIVED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const details = [
    "Sipariş alındı",
    "Sipariş hazırlanıyor",
    "Kargoya verildi",
    "Teslim edildi"
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= statuses.length) {
      clearInterval(interval);
      call.end();
      return;
    }
    call.write({
      order_id: orderId,
      status: statuses[index],
      timestamp: new Date().toISOString(),
      detail: details[index],
    });
    index++;
  }, 2000);
}

function BulkCreateOrders(call, callback) {
  let totalOrders = 0;
  let successfulOrders = 0;
  let failedOrders = 0;

  call.on('data', (request) => {
    totalOrders++;
    if (request.quantity > 0) successfulOrders++;
    else failedOrders++;
  });

  call.on('end', () => {
    callback(null, {
      total_orders: totalOrders,
      successful_orders: successfulOrders,
      failed_orders: failedOrders,
      summary_message: "Toplu sipariş aktarımı başarıyla tamamlandı."
    });
  });
}

function LiveOrderChat(call) {
  call.on('data', (message) => {
    console.log(`[CHAT] İstemci (${message.user}): ${message.message}`);
    
    call.write({
      user: "System",
      message: `Merhaba ${message.user}, '${message.message}' mesajınızı aldık. İlgileniyoruz.`,
      timestamp: new Date().toISOString()
    });
  });

  call.on('end', () => {
    call.end();
  });
}

function main() {
  const server = new grpc.Server();
  server.addService(orderProto.OrderService.service, { CreateOrder, TrackOrder, BulkCreateOrders, LiveOrderChat });

  const healthImpl = new HealthImplementation({
    "order.OrderService": "SERVING",
    "": "SERVING",
  });
  healthImpl.addToServer(server);

  // gRPC Server Reflection — grpcurl'ün proto dosyasına gerek kalmadan çalışmasını sağlar
  const reflection = new ReflectionService(orderPkgDef);
  reflection.addToServer(server);

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Order Service started on port 50051");
    server.start();
  });

  // REST API Sunucusu (Benchmark icn)
  const app = express();
  app.use(express.json());

  app.post('/api/orders', (req, res) => {
    const { product_id, quantity, customer_id } = req.body;
    const deadline = new Date();
    deadline.setSeconds(deadline.getSeconds() + 5);

    inventoryClient.ReduceStock({ product_id, quantity }, { deadline }, (err, response) => {
      if (err) {
        return res.status(400).json({ status: "FAILED", error: err.message });
      }
      res.json({
        order_id: `ORD-REST-${Math.floor(Math.random() * 10000)}`,
        status: "CONFIRMED",
        message: "Sipariş REST üzerinden başarıyla oluşturuldu"
      });
    });
  });

  app.listen(3001, '0.0.0.0', () => {
    console.log("Order Service (REST API) started on port 3000");
  });
}

main();
