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
- **Server Streaming:** Real-time stream simulations.
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
3. **Run E2E Evalaution/Tests:**
In a separate terminal, trigger the evaluation client to simulate 4 different scenarios:
```bash
docker-compose exec order-service node client.js
```

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
3. **Testleri ve Akışı Gözlemleyin:**
Sistem sağlıklı bir şekilde ayağa kalktıktan sonra, 4 farklı başarılı, başarısız ve stream (akış) senaryosunu denemek için internal testi tetikleyin:
```bash
docker-compose exec order-service node client.js
```
