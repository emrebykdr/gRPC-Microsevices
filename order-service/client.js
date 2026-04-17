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
          console.log("[STREAM] Takip tamamlandı\n");
          runClientStreamingTest();
        });

        stream.on('error', (err) => {
          console.error("[STREAM HATA]", err.message);
        });
    });
  });
});

function runClientStreamingTest() {
  console.log("[TEST 5] BulkCreateOrders (Client Streaming) başlatılıyor...");
  const call = orderClient.BulkCreateOrders((err, response) => {
    if (err) console.error("[TEST 5 HATA]", err.message);
    else console.log("[TEST 5 BAŞARILI] Toplu sipariş sonucu:", response, "\n");
    
    runBidirectionalStreamingTest();
  });

  // Client gönderimi
  call.write({ product_id: "PROD-001", quantity: 5, customer_id: "CUST-A" });
  call.write({ product_id: "PROD-002", quantity: 0, customer_id: "CUST-B" }); // Başarısız sayılacak (qty=0)
  call.write({ product_id: "PROD-004", quantity: 1, customer_id: "CUST-A" });
  
  // İşlemleri bitirdik
  call.end();
}

function runBidirectionalStreamingTest() {
  console.log("[TEST 6] LiveOrderChat (Bidirectional Streaming) başlatılıyor...");
  const call = orderClient.LiveOrderChat();

  call.on('data', (response) => {
    console.log(`[CHAT CEVAP] ${response.user}: ${response.message} (${response.timestamp})`);
  });

  call.on('end', () => {
    console.log("[CHAT] Sunucu bağlantıyı kapattı.");
  });

  call.on('error', (err) => {
    console.error("[CHAT HATA]", err);
  });

  // 1. mesaj
  call.write({ user: "Alice", message: "Siparişim nerede kaldı?" });
  
  // 2. mesaj
  setTimeout(() => {
    call.write({ user: "Alice", message: "Adresimi değiştirmek istiyorum." });
    call.end(); // İletişimi sonlandır
  }, 1000);
}
