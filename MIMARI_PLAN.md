# gRPC Tabanlı Mikroservis İletişim Mimarisi
### Teknik Uygulama Rehberi — Nisan 2026

> **Kapsam:** Order Service • Inventory Service • Notification Service  
> **Teknoloji:** Node.js + Python | gRPC + Protobuf | Docker Compose  
> **Boyut:** 8 Zorunlu Özellik • 6 Aşama • 24 Task

---

## İçindekiler

1. [Teknik Mimari Genel Bakış](#1-teknik-mimari-genel-bakış)
   - 1.1 [Sistem Topolojisi](#11-sistem-topolojisi)
   - 1.2 [İletişim Akış Diyagramı](#12-i̇letişim-akış-diyagramı-call-chain)
   - 1.3 [gRPC İletişim Tipleri](#13-grpc-i̇letişim-tipleri)
   - 1.4 [Proje Klasör Yapısı](#14-proje-klasör-yapısı)
2. [Implementation Plan — Aşama ve Task Tablosu](#2-implementation-plan--aşama-ve-task-tablosu)
3. [Detaylı Aşama Açıklamaları](#3-detaylı-aşama-açıklamaları)
   - 3.1 [Aşama 1: Proje İskeleti ve Altyapı](#31-aşama-1-proje-i̇skeleti-ve-altyapı)
   - 3.2 [Aşama 2: Protocol Buffers (.proto) Dosyaları](#32-aşama-2-protocol-buffers-proto-dosyaları)
   - 3.3 [Aşama 3: Servis Implementasyonları](#33-aşama-3-servis-implementasyonları)
   - 3.4 [Aşama 4: Error Handling & Health Check](#34-aşama-4-error-handling--health-check)
   - 3.5 [Aşama 5: Docker & Orkestrasyon](#35-aşama-5-docker--orkestrasyon)
   - 3.6 [Aşama 6: Test ve Doğrulama](#36-aşama-6-test-ve-doğrulama)
4. [Zorunlu Özellik Kontrol Listesi](#4-zorunlu-özellik-kontrol-listesi)
5. [İlerleme Takip ve Onay Tablosu](#5-i̇lerleme-takip-ve-onay-tablosu)
6. [Sonuç ve Öneriler](#6-sonuç-ve-öneriler)

---

## 1. Teknik Mimari Genel Bakış

Bu bölüm, projenin teknik altyapısını, servisler arası ilişkileri ve veri akışını tanımlar. Projenin tüm uygulama aşamaları bu mimariye göre şekillendirilecektir.

### 1.1. Sistem Topolojisi

Sistem **3 bağımsız mikroservisten** oluşur. Her servis kendi Docker konteyneri içinde çalışır ve birbirleriyle yalnızca **gRPC** üzerinden haberleşir. Hiçbir servis diğerinin veritabanına veya dahili state'ine doğrudan erişemez.

| Servis | Dil | Port | Sorumluluk |
|---|---|---|---|
| **Order Service** | Node.js | 50051 | Sipariş oluşturma, diğer servisleri tetikleme, streaming ile durum takibi |
| **Inventory Service** | Node.js | 50052 | Stok kontrolü, stok düşme, ürün envanteri yönetimi |
| **Notification Service** | Python | 50053 | Bildirim gönderme (e-posta simülasyonu), loglama |

---

### 1.2. İletişim Akış Diyagramı (Call Chain)

Aşağıdaki akış, bir sipariş oluşturulduğunda servislerin birbirleriyle nasıl etkileştiğini gösterir:

```
┌────────────┐    gRPC Unary     ┌───────────────────┐
│   Client   │ ─────────────▶   │   Order Service   │
└────────────┘                  └─────────┬─────────┘
                                          │
                            ┌─────────────┴─────────────┐
                            │                           │
                 Unary RPC  ▼                           ▼  Unary RPC
          ┌───────────────────┐          ┌──────────────────────┐
          │ Inventory Service │          │ Notification Service │
          └───────────────────┘          └──────────────────────┘
```

**Akış özeti:**
1. Client → Order Service: `CreateOrder` isteği gönderir.
2. Order Service → Inventory Service: `ReduceStock` çağrısı yapar.
3. Order Service → Notification Service: `SendNotification` çağrısı yapar.
4. Order Service → Client: Sonucu döner.

---

### 1.3. gRPC İletişim Tipleri

Projede kullanılacak gRPC çağrı tipleri:

| Tip | Client | Server | Metod | Servis |
|---|---|---|---|---|
| Unary RPC | 1 mesaj | 1 mesaj | `CreateOrder` | Order |
| Unary RPC | 1 mesaj | 1 mesaj | `ReduceStock` | Inventory |
| Unary RPC | 1 mesaj | 1 mesaj | `SendNotification` | Notification |
| **Server Streaming** | 1 mesaj | N mesaj | `TrackOrder` | Order |

> **Not:** Server Streaming RPC, Client'ın tek bir istek göndermesi karşılığında Server'ın birden fazla mesajı sırayla ilettiği iletişim modelidir. `TrackOrder`'da sipariş durumu güncellemeleri bu şekilde aktarılır.

---

### 1.4. Proje Klasör Yapısı

Projenin tamamlandığında sahip olacağı hedef klasör yapısı:

```
grpc-microservices/
├── proto/                          # Merkezi .proto dosyaları (servis sözleşmeleri)
│   ├── order.proto
│   ├── inventory.proto
│   └── notification.proto
│
├── order-service/                  # Node.js — Port 50051
│   ├── server.js                   # gRPC server + call chain
│   ├── client.js                   # Test client
│   ├── package.json
│   └── Dockerfile
│
├── inventory-service/              # Node.js — Port 50052
│   ├── server.js                   # Stok yönetimi
│   ├── package.json
│   └── Dockerfile
│
├── notification-service/           # Python — Port 50053
│   ├── server.py                   # Bildirim servisi
│   ├── generate_pb.sh              # Proto codegen script
│   ├── generated/                  # Protobuf codegen çıktıları
│   │   ├── notification_pb2.py
│   │   └── notification_pb2_grpc.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml              # Tüm sistem orkestrasyonu
└── README.md
```

---

## 2. Implementation Plan — Aşama ve Task Tablosu

Aşağıdaki tablo, projenin tüm aşamalarını ve her aşamadaki görevleri özetler. Her task bağımsız olarak onaylanabilir ve sırayla ilerlenebilir.

| ID | Task Adı | Açıklama | Çıktı / Dosya |
|---|---|---|---|
| **AŞAMA 1: Proje İskeleti ve Altyapı** | | | |
| 1.1 | Git repo oluştur | GitHub'da repo aç, `.gitignore` ve `README` ekle | GitHub repo URL |
| 1.2 | Klasör yapısını kur | `proto/`, `order-service/`, `inventory-service/`, `notification-service/` dizinlerini oluştur | Klasör ağacı |
| 1.3 | Node.js bağımlılıkları | Her Node servisinde `npm init` + gRPC paketleri kur | `package.json` ×2 |
| 1.4 | Python bağımlılıkları | `requirements.txt` oluştur: `grpcio`, `grpcio-tools`, `grpcio-health-checking` | `requirements.txt` |
| **AŞAMA 2: Proto Dosyaları (Schema-First)** | | | |
| 2.1 | `order.proto` yaz | `OrderService`: `CreateOrder` (Unary) + `TrackOrder` (Server Streaming) tanımla | `proto/order.proto` |
| 2.2 | `inventory.proto` yaz | `InventoryService`: `CheckStock` + `ReduceStock` (Unary) tanımla | `proto/inventory.proto` |
| 2.3 | `notification.proto` yaz | `NotificationService`: `SendNotification` (Unary) tanımla | `proto/notification.proto` |
| 2.4 | Python codegen script | `grpc_tools.protoc` ile Python stub üretimi için script yaz | `generate_pb.sh` |
| **AŞAMA 3: Servis Implementasyonları** | | | |
| 3.1 | Inventory `server.js` | `CheckStock` + `ReduceStock` implement et, in-memory stok Map kullan | `inventory-service/server.js` |
| 3.2 | Notification `server.py` | `SendNotification` implement et, Python ile console log bildirimi | `notification-service/server.py` |
| 3.3 | Order `server.js` | `CreateOrder` implement et: Inventory client + Notification client çağrı zinciri kur | `order-service/server.js` |
| 3.4 | TrackOrder streaming | Server Streaming RPC: sıralı durum güncellemelerini stream et | `order-service/server.js` |
| **AŞAMA 4: Error Handling & Health Check** | | | |
| 4.1 | gRPC status codes ekle | `NOT_FOUND`, `FAILED_PRECONDITION`, `UNAVAILABLE`, `DEADLINE_EXCEEDED` kodlarını implement et | Tüm server dosyaları |
| 4.2 | Timeout/deadline ekle | Client çağrılarına 5 sn deadline ekle | `order-service/server.js` |
| 4.3 | Node.js health check | Order + Inventory servislerine health endpoint ekle | ×2 `server.js` |
| 4.4 | Python health check | `grpcio-health-checking` ile Notification health endpoint ekle | `notification-service/server.py` |
| **AŞAMA 5: Docker & Orkestrasyon** | | | |
| 5.1 | Node Dockerfile ×2 | Order ve Inventory için multi-stage Dockerfile yaz | `Dockerfile` ×2 |
| 5.2 | Python Dockerfile | Notification için Dockerfile yaz | `Dockerfile` |
| 5.3 | `docker-compose.yml` | 3 servis + network + `depends_on` + port mapping tanımla | `docker-compose.yml` |
| 5.4 | Compose test | `docker-compose up --build` ile tüm sistemi ayağa kaldır ve doğrula | Terminal çıktısı |
| **AŞAMA 6: Test & Doğrulama** | | | |
| 6.1 | Test client yaz | Tüm RPC çağrılarını test eden Node.js client script | `order-service/client.js` |
| 6.2 | Hata senaryoları test | Stok yetersizliği, timeout, servis çökme senaryolarını test et | Test çıktıları |
| 6.3 | Health check test | `grpcurl` ile 3 servisin health durumunu doğrula | Terminal çıktısı |
| 6.4 | Streaming test | `TrackOrder` stream'ini dinle, 4 durum mesajını doğrula | Test çıktısı |

---

## 3. Detaylı Aşama Açıklamaları

Her aşamanın teknik detayları, yazılacak kodun yapısı ve dikkat edilmesi gereken noktalar aşağıda açıklanmıştır.

---

### 3.1. Aşama 1: Proje İskeleti ve Altyapı

> **Hedef:** Projenin klasör yapısını, versiyon kontrolünü ve tüm bağımlılıkları kurmak. Bu aşama sonunda hiçbir iş mantığı yazılmamış, ancak tüm araç zinciri hazır olacaktır.

#### Task 1.1 — Git Repository

GitHub'da yeni bir repository oluştur. Önerilen isim: `grpc-microservices-demo`

```bash
git init
git remote add origin https://github.com/<username>/grpc-microservices-demo.git
```

`.gitignore` dosyasına eklenecekler:
```
node_modules/
__pycache__/
*.pyc
notification-service/generated/
.env
```

---

#### Task 1.2 — Klasör Yapısı

```bash
mkdir -p proto order-service inventory-service notification-service/generated

# Proto dosyaları (boş olarak oluştur)
touch proto/order.proto proto/inventory.proto proto/notification.proto

# Servis giriş dosyaları
touch order-service/server.js order-service/client.js
touch inventory-service/server.js
touch notification-service/server.py notification-service/generate_pb.sh

# Proje kök dosyaları
touch docker-compose.yml README.md
```

---

#### Task 1.3 — Node.js Bağımlılıkları

Her iki Node servisi için aşağıdaki komutlar sırayla çalıştırılır:

```bash
# Order Service
cd order-service && npm init -y
npm install @grpc/grpc-js @grpc/proto-loader grpc-health-check

# Inventory Service
cd ../inventory-service && npm init -y
npm install @grpc/grpc-js @grpc/proto-loader grpc-health-check
```

| Paket | Açıklama |
|---|---|
| `@grpc/grpc-js` | gRPC'nin saf JavaScript implementasyonu (C++ bağımlılığı yok) |
| `@grpc/proto-loader` | `.proto` dosyalarını runtime'da dinamik olarak yükler; ayrıca codegen gerekmez |
| `grpc-health-check` | Standart gRPC Health Check protokolü implementasyonu |

---

#### Task 1.4 — Python Bağımlılıkları

`notification-service/requirements.txt` dosyasına aşağıdakiler yazılır:

```text
grpcio==1.62.0
grpcio-tools==1.62.0
grpcio-health-checking==1.62.0
protobuf==4.25.3
```

Kurulum:
```bash
cd notification-service
pip install -r requirements.txt
```

> **Not:** `grpcio-tools`, `.proto` dosyalarından Python kodu üretmek için gereklidir. `grpcio-health-checking` ise standart health check protokolü içindir.

---

### 3.2. Aşama 2: Protocol Buffers (.proto) Dosyaları

> **Hedef:** Tüm servis sözleşmelerini (service contract) merkezi `.proto` dosyalarında tanımlamak. Bu dosyalar projenin **"teknik sözleşmesi"** olup tüm servislerin ortak dilidir.

---

#### Task 2.1 — `order.proto`

Bu dosya iki RPC metod tanımlar: `CreateOrder` (Unary) ve `TrackOrder` (Server Streaming).

```protobuf
syntax = "proto3";
package order;

service OrderService {
  // Unary RPC: Tek istek, tek yanıt
  rpc CreateOrder (CreateOrderRequest) returns (CreateOrderResponse);

  // Server Streaming RPC: Tek istek, çoklu yanıt akışı
  rpc TrackOrder (TrackOrderRequest) returns (stream OrderStatusUpdate);
}

message CreateOrderRequest {
  string product_id  = 1;   // Ürün kimliği
  int32  quantity    = 2;   // Sipariş miktarı
  string customer_id = 3;   // Müşteri kimliği
}

message CreateOrderResponse {
  string order_id = 1;   // Üretilen sipariş ID
  string status   = 2;   // "CONFIRMED" veya "FAILED"
  string message  = 3;   // Detay mesajı
}

message TrackOrderRequest {
  string order_id = 1;
}

message OrderStatusUpdate {
  string order_id  = 1;
  string status    = 2;   // RECEIVED | PROCESSING | SHIPPED | DELIVERED
  string timestamp = 3;
  string detail    = 4;
}
```

> **Teknik Not:** `stream` anahtar kelimesi return tipinin önüne yazılarak Server Streaming tanımlanır. Bu, server'ın tek bir istek karşılığında birden fazla mesajı sırayla göndermesini sağlar.

---

#### Task 2.2 — `inventory.proto`

```protobuf
syntax = "proto3";
package inventory;

service InventoryService {
  rpc CheckStock  (CheckStockRequest)  returns (CheckStockResponse);
  rpc ReduceStock (ReduceStockRequest) returns (ReduceStockResponse);
}

message CheckStockRequest {
  string product_id = 1;
}

message CheckStockResponse {
  string product_id          = 1;
  int32  available_quantity  = 2;
  bool   in_stock            = 3;
}

message ReduceStockRequest {
  string product_id = 1;
  int32  quantity   = 2;
}

message ReduceStockResponse {
  bool   success         = 1;
  string message         = 2;
  int32  remaining_stock = 3;
}
```

---

#### Task 2.3 — `notification.proto`

```protobuf
syntax = "proto3";
package notification;

service NotificationService {
  rpc SendNotification (SendNotificationRequest) returns (SendNotificationResponse);
}

message SendNotificationRequest {
  string customer_id = 1;
  string order_id    = 2;
  string type        = 3;   // "ORDER_CONFIRMED" | "OUT_OF_STOCK"
  string message     = 4;
}

message SendNotificationResponse {
  bool   success         = 1;
  string notification_id = 2;
}
```

---

#### Task 2.4 — Python Codegen Script

Python, Node.js'in aksine proto dosyalarını runtime'da yükleyemez; önceden derlenmesi gerekir.

```bash
# notification-service/generate_pb.sh

python -m grpc_tools.protoc \
  -I../proto \
  --python_out=./generated \
  --grpc_python_out=./generated \
  ../proto/notification.proto
```

**Çıktılar** (`generated/` klasörü):
- `notification_pb2.py` — Mesaj sınıfları
- `notification_pb2_grpc.py` — Servis stub'ları

> **Önemli:** Bu script, her proto değişikliğinde yeniden çalıştırılmalıdır. Aksi hâlde eski stub'lar kullanılır ve tutarsızlıklar oluşur.

---

### 3.3. Aşama 3: Servis Implementasyonları

> **Hedef:** Her 3 servisin gRPC server kodunu yazmak, iş mantıklarını implement etmek ve servisler arası çağrı zincirini kurmak.

---

#### Task 3.1 — Inventory Service (`inventory-service/server.js`)

Bu servis en bağımsız olandır; başka servise bağımlılığı yoktur. Bu nedenle ilk implement edilmelidir.

**Yapılacaklar:**

1. `@grpc/proto-loader` ile `proto/inventory.proto` dosyasını yükle
2. In-memory stok haritası (`JavaScript Map`) oluştur ve başlangıç verileriyle doldur
3. `CheckStock`: `product_id`'ye göre mevcut stoğu dön
4. `ReduceStock`: Stok yeterliyse miktarı düşür ve başarılı yanıt dön; yetersizse hata fırlat
5. Server'ı `50052` portunda başlat

**Başlangıç stok verisi:**

```javascript
const stockMap = new Map([
  ["PROD-001", { name: "Laptop",   quantity: 50,  price: 999.99 }],
  ["PROD-002", { name: "Mouse",    quantity: 200, price: 29.99  }],
  ["PROD-003", { name: "Keyboard", quantity: 0,   price: 79.99  }],  // Stok yok!
]);
```

---

#### Task 3.2 — Notification Service (`notification-service/server.py`)

Python ile yazılarak projenin çoklu dil (polyglot) desteğini gösterir.

**Yapılacaklar:**

1. Generate edilmiş stub'ları import et (`notification_pb2`, `notification_pb2_grpc`)
2. `NotificationServiceServicer` class'ını oluştur
3. `SendNotification`: Gelen bildirim isteğini logla, üretilen `notification_id`'yi dön
4. `grpc` standart server oluştur
5. Server'ı `50053` portunda başlat

```python
class NotificationServiceServicer(notification_pb2_grpc.NotificationServiceServicer):
    def SendNotification(self, request, context):
        notif_id = f"NOTIF-{uuid.uuid4().hex[:8].upper()}"
        print(f"[NOTIFICATION] {request.type} -> Customer: {request.customer_id}")
        print(f"[NOTIFICATION] Message: {request.message}")
        return notification_pb2.SendNotificationResponse(
            success=True,
            notification_id=notif_id
        )
```

---

#### Task 3.3 — Order Service — CreateOrder + Call Chain (`order-service/server.js`)

Order Service hem kendi gRPC server'ını sunar hem de diğer iki servisin client'ı olarak çalışır. Bu, **çağrı zincirinin (call chain) kalbidir.**

**`CreateOrder` iş akışı:**

```
İstek al (product_id, quantity, customer_id)
       │
       ▼
Inventory.ReduceStock(product_id, quantity)
       │
  ┌────┴────────┐
  │ Başarılı?  │
  ├─── Evet ───▶  Notification.SendNotification("ORDER_CONFIRMED")
  │                      │
  └─── Hayır ──▶  Notification.SendNotification("OUT_OF_STOCK")
                         │
                         ▼
               Sonuç yanıtını Client'a dön
```

**Kritik Tasarım Kararı:** Order Service, diğer servislere bağlanırken Docker network üzerindeki servis isimlerini kullanır. `localhost` yerine `inventory-service:50052` ve `notification-service:50053` adreslerini kullanır. Bu adresler ortam değişkenlerinden (environment variables) okunacak şekilde yazılmalıdır:

```javascript
// order-service/server.js — Client bağlantıları
const INVENTORY_HOST     = process.env.INVENTORY_HOST     || 'localhost:50052';
const NOTIFICATION_HOST  = process.env.NOTIFICATION_HOST  || 'localhost:50053';

const inventoryClient = new inventoryProto.InventoryService(
  INVENTORY_HOST, grpc.credentials.createInsecure()
);
const notificationClient = new notificationProto.NotificationService(
  NOTIFICATION_HOST, grpc.credentials.createInsecure()
);
```

---

#### Task 3.4 — TrackOrder (Server Streaming)

Bu task, projede Server Streaming RPC örneğini sağlar. Client tek bir `order_id` gönderir, server sırasıyla **4 farklı durum mesajını** stream eder:

```javascript
function TrackOrder(call) {
  const orderId  = call.request.order_id;
  const statuses = ["RECEIVED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const details  = [
    "Sipariş alındı",
    "Sipariş hazırlanıyor",
    "Kargoya verildi",
    "Teslim edildi"
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index >= statuses.length) {
      clearInterval(interval);
      call.end();   // Stream'i kapat
      return;
    }
    call.write({
      order_id:  orderId,
      status:    statuses[index],
      timestamp: new Date().toISOString(),
      detail:    details[index],
    });
    index++;
  }, 2000);  // Her 2 saniyede bir güncelleme
}
```

> **Not:** `setInterval` ile her 2 saniyede bir durum gönderilir; bu gerçek zamanlı takibi simüle eder. `call.write()` her bir mesajı gönderir, `call.end()` stream'i sonlandırır.

---

### 3.4. Aşama 4: Error Handling & Health Check

> **Hedef:** Servislerin hata durumlarında anlamlı gRPC status code dönmesini ve her servisin sağlık durumunun sorgulanabilmesini sağlamak.

---

#### Task 4.1 — gRPC Status Code Implementasyonu

Her servis, hata durumlarında standart gRPC kodlarını döner:

| Kod | Senaryo | Servis | Açıklama |
|---|---|---|---|
| `OK (0)` | Her şey başarılı | Hepsi | Normal yanıt |
| `NOT_FOUND (5)` | Ürün bulunamadı | Inventory | `product_id` stokta yok |
| `FAILED_PRECONDITION (9)` | Yetersiz stok | Inventory | Stok < istenen miktar |
| `UNAVAILABLE (14)` | Servis erişilemez | Order (client) | Inventory/Notification çöktü |
| `DEADLINE_EXCEEDED (4)` | Timeout | Order (client) | 5 sn içinde yanıt yok |
| `INTERNAL (13)` | Beklenmeyen hata | Hepsi | Sunucu iç hatası |

**Inventory Service'te hata dönüş örneği:**

```javascript
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
```

---

#### Task 4.2 — Timeout / Deadline

Order Service, diğer servislere çağrı yaparken **deadline (zaman aşımı)** belirler:

```javascript
// 5 saniye timeout ile çağrı
const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);

inventoryClient.ReduceStock(request, { deadline }, (err, response) => {
  if (err) {
    if (err.code === grpc.status.DEADLINE_EXCEEDED) {
      console.error("[TIMEOUT] Inventory Service yanıt vermedi!");
    }
    // Hata yönetimi...
  }
});
```

---

#### Task 4.3 — Node.js Health Check

`grpc-health-check` paketi kullanılarak her Node servisine health endpoint eklenir:

```javascript
const { HealthImplementation } = require("grpc-health-check");

const healthImpl = new HealthImplementation({
  "inventory.InventoryService": "SERVING",
  "":                           "SERVING",  // Genel servis durumu
});

healthImpl.addToServer(server);
```

---

#### Task 4.4 — Python Health Check

```python
from grpc_health.v1 import health_pb2, health_pb2_grpc, health

health_servicer = health.HealthServicer()
health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)

# Servis durumunu SERVING olarak ayarla
health_servicer.set(
    "notification.NotificationService",
    health_pb2.HealthCheckResponse.SERVING
)
health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)
```

---

### 3.5. Aşama 5: Docker & Orkestrasyon

> **Hedef:** Her servisi ayrı bir Docker konteyneri olarak paketlemek ve tüm sistemi tek bir komutla (`docker-compose up`) ayağa kaldırmak.

---

#### Task 5.1 — Node.js Dockerfile

Order Service ve Inventory Service için ortak Dockerfile yapısı:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları önce kopyala (Docker cache optimizasyonu)
COPY package*.json ./
RUN npm ci --only=production

# Proto dosyalarını kopyala
COPY proto ./proto

# Uygulama kodunu kopyala
COPY . .

EXPOSE 50051
CMD ["node", "server.js"]
```

> **Not:** `context: .` (kök dizin) build bağlamı olarak ayarlandığından proto dosyaları tüm servisler tarafından erişilebilir. Bu detay Task 5.3'te çözülür.

---

#### Task 5.2 — Python Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proto dosyalarını kopyala ve codegen çalıştır
COPY proto ./proto
COPY generate_pb.sh .
RUN mkdir -p generated && bash generate_pb.sh

COPY . .

EXPOSE 50053
CMD ["python", "server.py"]
```

---

#### Task 5.3 — `docker-compose.yml`

Tüm servisleri, ağ yapılandırmasını ve bağımlılık sırasını tanımlar:

```yaml
version: '3.8'

services:

  order-service:
    build:
      context: .                           # Kök dizin (proto erişimi için)
      dockerfile: order-service/Dockerfile
    ports:
      - "50051:50051"
    environment:
      - INVENTORY_HOST=inventory-service:50052
      - NOTIFICATION_HOST=notification-service:50053
    depends_on:
      - inventory-service
      - notification-service
    networks:
      - grpc-net
    restart: on-failure

  inventory-service:
    build:
      context: .
      dockerfile: inventory-service/Dockerfile
    ports:
      - "50052:50052"
    networks:
      - grpc-net
    restart: on-failure

  notification-service:
    build:
      context: .
      dockerfile: notification-service/Dockerfile
    ports:
      - "50053:50053"
    networks:
      - grpc-net
    restart: on-failure

networks:
  grpc-net:
    driver: bridge
```

**Dikkat Edilecek Noktalar:**

| Ayar | Açıklama |
|---|---|
| `context: .` | Proto klasörü tüm servisler tarafından erişilebilir hâle gelir |
| `depends_on` | Order Service'in diğer servislerden sonra başlamasını garanti eder *(ancak "hazır" olduğunu değil!)* |
| `restart: on-failure` | Servis çökerse otomatik yeniden başlatılır |
| `grpc-net` | Tüm servisler aynı Docker network içinde olduğu için birbirlerine servis adıyla ulaşabilir |

---

#### Task 5.4 — Compose ile Sistemi Ayağa Kaldırma

```bash
# Tüm servisleri build et ve başlat (foreground)
docker-compose up --build

# Arka planda çalıştırmak için
docker-compose up --build -d

# Logları gerçek zamanlı takip et
docker-compose logs -f

# Çalışan container'ları listele
docker-compose ps

# Servisleri durdur ve temizle
docker-compose down
```

---

### 3.6. Aşama 6: Test ve Doğrulama

> **Hedef:** Tüm çağrı zincirini, hata senaryolarını, streaming'i ve health check'leri test ederek projenin 8 zorunlu özelliğinin doğru çalıştığını kanıtlamak.

---

#### Task 6.1 — Test Client (`order-service/client.js`)

Tüm RPC çağrılarını sırayla test eden bir Node.js script:

```javascript
// Test 1: Başarılı sipariş (stok: 50 → 48 olmalı)
orderClient.CreateOrder({
  product_id:  "PROD-001",
  quantity:    2,
  customer_id: "CUST-100"
}, (err, response) => {
  console.log("[TEST 1] Başarılı sipariş:", response);
});

// Test 2: Yetersiz stok → FAILED_PRECONDITION (9) beklenir
orderClient.CreateOrder({
  product_id:  "PROD-003",   // Başlangıç stoğu: 0
  quantity:    1,
  customer_id: "CUST-101"
}, (err, response) => {
  console.log("[TEST 2] Hata kodu:", err?.code, "| Mesaj:", err?.message);
});

// Test 3: Olmayan ürün → NOT_FOUND (5) beklenir
orderClient.CreateOrder({
  product_id:  "PROD-999",
  quantity:    1,
  customer_id: "CUST-102"
}, (err, response) => {
  console.log("[TEST 3] Hata kodu:", err?.code, "| Mesaj:", err?.message);
});
```

---

#### Task 6.2 — Hata Senaryoları Test Matrisi

| # | Senaryo | Beklenen Sonuç | Doğrulama |
|---|---|---|---|
| T1 | Başarılı sipariş (`PROD-001`, qty:2) | `status: "CONFIRMED"` | Stok 50→48 düşer |
| T2 | Stok yetersiz (`PROD-003`, qty:1) | `FAILED_PRECONDITION (9)` | Stok değişmez |
| T3 | Olmayan ürün (`PROD-999`) | `NOT_FOUND (5)` | Anlamlı hata mesajı |
| T4 | Inventory Service kapalı | `UNAVAILABLE (14)` | Order graceful hata döner |
| T5 | TrackOrder streaming | 4 mesaj: REC→PROC→SHIP→DEL | Stream düzgün biter |
| T6 | Health check (3 servis) | `SERVING` yanıtı | `grpcurl` ile doğrula |

---

#### Task 6.3 — `grpcurl` ile Health Check Doğrulama

```bash
# Tüm servislerin sağlık durumunu tek tek kontrol et
grpcurl -plaintext localhost:50051 grpc.health.v1.Health/Check
grpcurl -plaintext localhost:50052 grpc.health.v1.Health/Check
grpcurl -plaintext localhost:50053 grpc.health.v1.Health/Check

# Beklenen yanıt (her servis için):
# { "status": "SERVING" }
```

---

#### Task 6.4 — Streaming Test

```javascript
// client.js içinde streaming test
const stream = orderClient.TrackOrder({ order_id: 'ORD-001' });

stream.on('data', (update) => {
  console.log(`[STREAM] ${update.status} - ${update.detail} (${update.timestamp})`);
});

stream.on('end', () => {
  console.log("[STREAM] Takip tamamlandı — 4 durum alındı.");
});

stream.on('error', (err) => {
  console.error("[STREAM HATA]", err.message);
});
```

**Beklenen stream çıktısı:**
```
[STREAM] RECEIVED   - Sipariş alındı        (2026-04-17T10:00:00.000Z)
[STREAM] PROCESSING - Sipariş hazırlanıyor  (2026-04-17T10:00:02.000Z)
[STREAM] SHIPPED    - Kargoya verildi       (2026-04-17T10:00:04.000Z)
[STREAM] DELIVERED  - Teslim edildi         (2026-04-17T10:00:06.000Z)
[STREAM] Takip tamamlandı — 4 durum alındı.
```

---

## 4. Zorunlu Özellik Kontrol Listesi

Projenin 8 zorunlu özelliği, bunları sağlayan task'lar ve doğrulama yöntemleri:

| # | Özellik | İlgili Task'lar | Doğrulama | Dosyalar |
|---|---|---|---|---|
| 1 | 3 bağımsız mikroservis | 3.1–3.4 | `docker-compose ps` ile 3 container listele | 3× server dosyası |
| 2 | `.proto` ile schema tanımı | 2.1–2.3 | 3 ayrı `.proto` dosyası mevcut | `proto/*.proto` |
| 3 | Unary RPC çağrıları | 3.1–3.3 | `CreateOrder`, `ReduceStock`, `SendNotification` | `server.js`, `server.py` |
| 4 | Server Streaming | 3.4 | `TrackOrder` 4 mesaj stream eder | `order-service/server.js` |
| 5 | Çağrı zinciri (Call Chain) | 3.3 | Order → Inventory → Notification | `order-service/server.js` |
| 6 | Error Handling | 4.1–4.2 | 6 farklı gRPC status code aktif | Tüm server dosyaları |
| 7 | Docker Compose | 5.1–5.4 | `docker-compose up --build` çalışır | `docker-compose.yml` |
| 8 | Health Check | 4.3–4.4 | `grpcurl` ile `SERVING` yanıtı alınır | Tüm server dosyaları |

---

## 5. İlerleme Takip ve Onay Tablosu

Her task tamamlandığında durumu güncelle. Durum kodları: `□ Bekliyor` | `▶ Devam Ediyor` | `✓ Tamamlandı` | `✗ Sorunlu`

| ID | Task | Durum | Başlama | Bitiş |
|---|---|---|---|---|
| **1.1** | Git repo oluştur | □ Bekliyor | |  |
| **1.2** | Klasör yapısını kur | □ Bekliyor | |  |
| **1.3** | Node.js bağımlılıkları | □ Bekliyor | |  |
| **1.4** | Python bağımlılıkları | □ Bekliyor | |  |
| **2.1** | `order.proto` yaz | □ Bekliyor | |  |
| **2.2** | `inventory.proto` yaz | □ Bekliyor | |  |
| **2.3** | `notification.proto` yaz | □ Bekliyor | |  |
| **2.4** | Python codegen script | □ Bekliyor | |  |
| **3.1** | Inventory `server.js` | □ Bekliyor | |  |
| **3.2** | Notification `server.py` | □ Bekliyor | |  |
| **3.3** | Order `server.js` + Call Chain | □ Bekliyor | |  |
| **3.4** | TrackOrder streaming | □ Bekliyor | |  |
| **4.1** | gRPC status codes | □ Bekliyor | |  |
| **4.2** | Timeout/deadline | □ Bekliyor | |  |
| **4.3** | Node.js health check | □ Bekliyor | |  |
| **4.4** | Python health check | □ Bekliyor | |  |
| **5.1** | Node Dockerfile ×2 | □ Bekliyor | |  |
| **5.2** | Python Dockerfile | □ Bekliyor | |  |
| **5.3** | `docker-compose.yml` | □ Bekliyor | |  |
| **5.4** | Compose test | □ Bekliyor | |  |
| **6.1** | Test client yaz | □ Bekliyor | |  |
| **6.2** | Hata senaryoları test | □ Bekliyor | |  |
| **6.3** | Health check test | □ Bekliyor | |  |
| **6.4** | Streaming test | □ Bekliyor | |  |

---

## 6. Sonuç ve Öneriler

### 6.1. Önerilen İş Akışı

1. **Sıralı ilerleme:** Her aşamayı sırasıyla tamamla; bir sonrakine geçmeden önce tüm task'ları bitir.
2. **Küçük adımlarla test:** Her task'ı tamamladıktan sonra kısa bir test yap ve çalıştığından emin ol.
3. **Unit → Integration:** Aşama 3'te servisleri tek tek test et (unit test), Aşama 6'da tüm zinciri test et (integration test).
4. **Düzenli commit:** Her önemli adımda `git commit` yap ve anlamlı commit mesajları kullan.
5. **Önce local, sonra Docker:** Docker aşamasına geçmeden önce servislerin `localhost`'ta çalıştığından emin ol.

---

### 6.2. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|---|---|
| **Proto import hataları** | Node.js'te `proto-loader` path'ini, Python'da `-I` flag'ini kontrol et. Yolların `.proto` dosyasının gerçek konumunu gösterdiğinden emin ol. |
| **Docker network erişimi** | Servisler arası iletişimde `localhost` değil, `docker-compose.yml`'deki servis adını kullan (`inventory-service`, `notification-service`). |
| **Port çakışması** | Eğer portlar zaten kullanılıyorsa, `docker-compose.yml`'de dış portları değiştir (ör. `50151:50051`) ama iç portları sabit tut. |
| **Python codegen** | Her proto değişikliğinden sonra `generate_pb.sh`'ı yeniden çalıştırmayı unutma, aksi hâlde eski stub'lar kullanılır. |
| **`depends_on` yetersizliği** | `depends_on` yalnızca container başlangıcını garanti eder, "hazır" olmayı değil. Gerekirse servis içinde retry mekanizması ekle. |

---

> **Başlangıç:** Aşama 1, Task 1.1 (Git Repository kurulumu) ile ilerleyelim.
