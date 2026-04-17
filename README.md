# 🚀 gRPC Microservices Dashboard & Polyglot Architecture

[English Section](#english) | [Türkçe Bölüm](#türkçe)

---

## <a name="english"></a>🇬🇧 English

### 🌟 Overview
This project is a high-performance, **polyglot microservices ecosystem** featuring a premium **Glassmorphism Dashboard**. It demonstrates the power of **gRPC** and **Protocol Buffers** for seamless service-to-service communication and **gRPC-Web** for direct browser interaction via **Envoy Proxy**.

### 🛠 Architecture & Tech Stack
The system consists of independent services running in an isolated Docker network:

| Service | Technology | Role |
|---------|------------|------|
| **Frontend** | HTML5/CSS3/JS | Premium Dashboard for real-time interaction. |
| **Envoy Proxy** | C++ / YAML | Translates gRPC-Web (HTTP/1.1) to Native gRPC (HTTP/2). |
| **Order Service** | Node.js | Orchestrates orders and handles streaming status updates. |
| **Inventory Service**| Node.js | Manages stock, dynamic product creation, and listing. |
| **Notification** | Python | Polyglot worker sending cross-language binary alerts. |

### ✨ Key Features
- **Modern Dashboard:** Interact with all services through a sleek, responsive UI at `localhost:8081`.
- **Live Product Catalog:** Dynamically add, list, and manage products with real-time UI updates.
- **Full Streaming Support:** 
    - **Server Streaming:** Track orders in real-time.
    - **Client/Bidi Streaming:** Supported via native clients (Postman/Node) for high-throughput scenarios.
- **Error Resilience:** Implements standard gRPC status codes (`NOT_FOUND`, `FAILED_PRECONDITION`).
- **Polyglot Communication:** Seamless binary data exchange between Node.js and Python.
- **Performance Benchmarking:** Compare gRPC vs REST speeds with the built-in `benchmark.js`.

### 🚀 Getting Started

1. **Launch everything with Docker:**
   ```bash
   docker-compose up --build -d
   ```
2. **Access the Dashboard:**
   Open [http://localhost:8081](http://localhost:8081) in your browser.

3. **Test with Native Client:**
   ```bash
   docker-compose exec order-service node client.js
   ```

---

## <a name="türkçe"></a>🇹🇷 Türkçe

### 🌟 Genel Bakış
Bu proje; yüksek performanslı, **poli-glot (çok dilli) mikroservis mimarisini** ve premium bir **Glassmorphism Dashboard** arayüzünü bir araya getirir. **gRPC** ve **Protocol Buffers**'ın servisler arası iletişim gücünü, **Envoy Proxy** üzerinden **gRPC-Web** ile tarayıcıya taşır.

### 🛠 Mimari ve Teknoloji Yığını
Sistem, izole bir Docker ağında çalışan bağımsız servislerden oluşur:

| Servis | Teknoloji | Görev |
|--------|-----------|-------|
| **Frontend** | HTML5/CSS3/JS | Gerçek zamanlı etkileşim için modern kontrol paneli. |
| **Envoy Proxy**| C++ / YAML | gRPC-Web (HTTP/1.1) ve Native gRPC (HTTP/2) arasında köprü. |
| **Order Service**| Node.js | Sipariş akışını yönetir ve kargo durumu akışı sağlar. |
| **Inventory** | Node.js | Stok yönetimi, dinamik ürün ekleme ve listeleme yapar. |
| **Notification** | Python | Çok dilli yapıda, diller arası (cross-language) bildirimler yollar. |

### ✨ Öne Çıkan Özellikler
- **Modern Dashboard:** Tüm servislerle `localhost:8081` adresindeki şık ve duyarlı arayüz üzerinden etkileşime geçin.
- **Canlı Ürün Kataloğu:** Dinamik olarak ürün ekleyin, listeleyin ve stokları anlık takip edin.
- **Gelişmiş Akış (Streaming) Desteği:** 
    - **Server Streaming:** Siparişleri anlık olarak takip edin.
    - **Client/Bidi Streaming:** Native istemciler (Postman/Node) üzerinden tam kapasite test edilebilir.
- **Hata Yönetimi:** Standart gRPC statü kodları (`NOT_FOUND`, `FAILED_PRECONDITION`) ile dayanıklı yapı.
- **Performans Ölçümü:** `benchmark.js` ile gRPC ve REST arasındaki devasa hız farkını ölçün.

### 🚀 Başlangıç

1. **Her şeyi Docker ile başlatın:**
   ```bash
   docker-compose up --build -d
   ```
2. **Dashboard'a Erişin:**
   Tarayıcınızda [http://localhost:8081](http://localhost:8081) adresini açın.

3. **Native İstemci ile Test Edin:**
   ```bash
   docker-compose exec order-service node client.js
   ```

---
*Developed with ❤️ for Modern Microservices Learning.*
