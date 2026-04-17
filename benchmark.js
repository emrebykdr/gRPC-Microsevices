const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto/order.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true, longs: String, enums: String, defaults: true, oneofs: true
});
const orderProto = grpc.loadPackageDefinition(packageDefinition).order;
const client = new orderProto.OrderService('localhost:50051', grpc.credentials.createInsecure());

const REQUEST_COUNT = 500;

async function testREST() {
  const start = Date.now();
  const promises = [];
  for (let i = 0; i < REQUEST_COUNT; i++) {
    promises.push(
      fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: "PROD-001", quantity: 1, customer_id: "CUST-REST" })
      }).then(res => res.json()).catch(() => {})
    );
  }
  await Promise.all(promises);
  const end = Date.now();
  return end - start;
}

async function testGRPC() {
  const start = Date.now();
  const promises = [];
  for (let i = 0; i < REQUEST_COUNT; i++) {
    promises.push(new Promise((resolve) => {
      client.CreateOrder({ product_id: "PROD-001", quantity: 1, customer_id: "CUST-GRPC" }, (err, res) => {
        resolve();
      });
    }));
  }
  await Promise.all(promises);
  const end = Date.now();
  return end - start;
}

async function runBenchmark() {
  console.log(`=== REST vs gRPC Benchmark (${REQUEST_COUNT} istek) ===`);
  console.log("Sunucular ısınıyor...");
  
  // Isınma
  await testREST(); 
  await testGRPC(); 

  console.log("Test başlıyor...\n");

  const restTime = await testREST();
  console.log(`👉 [REST] Toplam Süre: ${restTime} ms`);

  const grpcTime = await testGRPC();
  console.log(`👉 [gRPC] Toplam Süre: ${grpcTime} ms`);
  
  if (grpcTime < restTime) {
    const diff = ((restTime - grpcTime) / restTime * 100).toFixed(2);
    console.log(`\n🎉 SONUÇ: gRPC, REST API'den yaklaşık %${diff} daha hızlı sonuç verdi!`);
  } else {
    console.log(`\nSONUÇ: REST daha hızlı.`);
  }
}

runBenchmark();
