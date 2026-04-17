const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../proto/order.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).order;
const orderClient = new orderProto.OrderService('localhost:50051', grpc.credentials.createInsecure());

console.log("=== gRPC Test Client ===\n");

// Test 1: Başarılı sipariş
orderClient.CreateOrder({
  product_id: "PROD-001",
  quantity: 2,
  customer_id: "CUST-100"
}, (err, response) => {
  if (err) console.error("[TEST 1 HATA]", err.message);
  else console.log("[TEST 1 BAŞARILI]", response);

  // Test 2: Yetersiz stok
  orderClient.CreateOrder({
    product_id: "PROD-003",
    quantity: 1,
    customer_id: "CUST-101"
  }, (err, response) => {
    if (err) console.log("[TEST 2 BEKLENEN HATA]", err.message, "Code:", err.code);
    else console.error("[TEST 2 BEKLENMEDİK BAŞARI]", response);
    
    // Test 3: Olmayan ürün
    orderClient.CreateOrder({
        product_id: "PROD-999",
        quantity: 1,
        customer_id: "CUST-102"
    }, (err, response) => {
        if (err) console.log("[TEST 3 BEKLENEN HATA]", err.message, "Code:", err.code);
        else console.error("[TEST 3 BEKLENMEDİK BAŞARI]", response);

        // Test 4: Streaming test
        console.log("\n[TEST 4] TrackOrder Streaming başlatılıyor...");
        const stream = orderClient.TrackOrder({ order_id: 'ORD-TEST01' });

        stream.on('data', (update) => {
          console.log(`[STREAM] ${update.status} - ${update.detail} (${update.timestamp})`);
        });

        stream.on('end', () => {
          console.log("[STREAM] Takip tamamlandı");
        });

        stream.on('error', (err) => {
          console.error("[STREAM HATA]", err.message);
        });
    });
  });
});
