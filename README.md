# 🚀 gRPC Microservices Architecture / Mikroservis Mimarisi

[English Section](#english) | [Türkçe Bölüm](#türkçe)

---

## <a name="english"></a>🇬🇧 English

### Overview
This project demonstrates a fully functional, polyglot microservices architecture built with **Node.js** and **Python**. It leverages **gRPC** and **Protocol Buffers** for high-performance interconnectivity between services.

### Architecture
The ecosystem consists of three independent microservices that communicate strictly over an internal Docker network using `Unary RPC` and `Server Streaming` mechanisms:

| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| **Order Service** | Node.js | `50051` | Orchestrates the order flow, triggers stock reductions, and streams order statuses. |
| **Inventory Service** | Node.js | `50052` | Manages stock quantities and provides precondition state checks. |
| **Notification Service** | Python | `50053` | Sends simulated order confirmations and out-of-stock alerts. |

### Key Features
- **Polyglot Design:** Node.js and Python running cohesively.
- **Strict Typing:** `.proto` schema definitions ensure cross-service safety.
- **Server Streaming:** Real-time stream simulations for tracking.
- **Client Streaming:** Bulk ordering simulation.
- **Bidirectional Streaming:** Real-time dual-way communication (Chat).
- **Benchmark:** Built-in tool to compare gRPC vs REST performance.
- **gRPC-Web (Browser):** Direct browser access via Envoy Proxy.
- **Call Chain:** Cross-service interconnectivity (Order → Inventory → Notification).
- **Error Handling:** Compliant with gRPC Status Codes (`NOT_FOUND`, `FAILED_PRECONDITION`).
- **Health Checks:** Native gRPC Health Check endpoint implementation.
- **Docker Compose:** Fully containerized orchestration.

### Getting Started

1. **Prerequisites:** Make sure Docker Desktop is installed and running.
2. **Launch Services:**
```bash
docker-compose up --build -d
```
```bash
docker-compose exec order-service node client.js
```

4. **Run REST vs gRPC Benchmark:**
Compare performance between gRPC and a standard REST API:
```bash
node benchmark.js
```

5. **Browser Access (gRPC-Web):**
Open your browser and navigate to:
`http://localhost:8081` - Direct gRPC calls from the browser console!


---

## <a name="türkçe"></a>🇹🇷 Türkçe

### Genel Bakış
Bu proje, **Node.js** ve **Python** ile inşa edilmiş, **gRPC** ve **Protocol Buffers** tabanlı performanslı bir poli-glot (çok dilli) mikroservis mimarisini göstermektedir. 

### Mimari
Sistem, `Unary RPC` ve `Server Streaming` metotlarını kullanarak izole bir köprü üzerinden iletişim kuran üç ayrı mikroservisten oluşur:

| Servis | Dil | Port | Sorumluluk |
|--------|-----|------|-------------|
| **Order Service** | Node.js | `50051` | Sipariş akışını yönetir, diğer servisleri tetikler ve streaming ile sipariş kargo durumu basar. |
| **Inventory Service** | Node.js | `50052` | In-memory stok miktarını yönetir ve azaltma işlemlerini gerçekleştirir. |
| **Notification Service** | Python | `50053` | Siparişin başarılı olması veya stoğun yetersizliği durumlarına göre loglar/bildirimler yollar. |

### Öne Çıkan Özellikler
- **Çoklu Dil (Polyglot):** Node.js ve Python'ın birlikte ahenkle çalışması.
- **Kesin Tipler:** Güçlü `.proto` şema sözleşmeleri ile veri sızıntısının önlenmesi.
- **Server Streaming:** Anlık sipariş kargo durumu takibi akışı (Streaming).
- **Client Streaming:** Toplu sipariş oluşturma (İstemciden sunucuya akış).
- **Bidirectional Streaming:** Karşılıklı anlık mesajlaşma/chat simülasyonu.
- **Benchmark:** gRPC ve REST API arasındaki devasa performans farkını ölçen araç.
- **gRPC-Web (Tarayıcı):** Envoy Proxy üzerinden doğrudan tarayıcı desteği.
- **Çağrı Zinciri (Call Chain):** Birbirine bağımlı kararlar alan servis ağı (Order → Inventory → Notification).
- **Graceful Error Handling:** Yetersiz stok ve bulunamayan ürünler için gRPC Statü kodlarına dayalı zararsız hata fırlatımı.
- **Sağlık Kontrolü (Health Checks):** Her servis için standarda uygun `SERVING` kontrol paneli.
- **Docker Compose:** İzole konteynerizasyon, minimum kurulum yükü ve özel ağ.

### Kurulum ve Çalıştırma

1. **Gereksinimler:** Bilgisayarınızda Docker Desktop aktif durumda olmalıdır.
2. **Servisleri Başlatın:**
Terminal klasörde açıkken uygulamayı docker üzerinden izole bir şekilde inşa edip başlatın:
```bash
docker-compose up --build -d
```
```bash
docker-compose exec order-service node client.js
```

4. **Performans Testi (Benchmark):**
gRPC'nin REST'ten ne kadar hızlı olduğunu kendi gözlerinizle görün:
```bash
node benchmark.js
```

5. **Tarayıcı Desteği (gRPC-Web):**
Şu adrese gidin:
`http://localhost:8081` - Tarayıcı üzerinden Envoy Proxy kullanarak gRPC çağrısı yapın.

