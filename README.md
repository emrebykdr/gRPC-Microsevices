# 🚀 gRPC Microservices Dashboard & Polyglot Architecture

[English Section](#english) | [Türkçe Bölüm](#türkçe)

---

## <a name="english"></a>🇬🇧 English

### 1. Project Name & Description
**gRPC Microservices Ecosystem**
A high-performance, polyglot (Node.js & Python) microservices architecture integrated with a modern Glassmorphism Web Dashboard via Envoy Proxy. This project demonstrates real-time data streaming, cross-language binary communication, and containerized orchestration.

### 2. Screenshot / Demo
![Dashboard Preview](https://via.placeholder.com/800x450?text=Glassmorphism+gRPC+Dashboard+Preview)
*(Note: Replace this with your actual dashboard screenshot at localhost:8081)*

### 3. Technologies Used
- **Backend:** Node.js (Order & Inventory Services), Python (Notification Service)
- **Communication:** gRPC, Protocol Buffers (proto3)
- **Proxy/Gateway:** Envoy Proxy (gRPC-Web translation)
- **Frontend:** HTML5, Vanilla CSS (Glassmorphism), JavaScript (gRPC-Web client)
- **Orchestration:** Docker, Docker Compose
- **Tools:** Postman (gRPC testing), Webpack (Frontend bundling)

### 4. Installation Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/emrebykdr/gRPC-Microsevices.git
   cd gRPC-Microsevices
   ```
2. **Ensure Docker is installed:** Download from [docker.com](https://www.docker.com/).
3. **Generate Proto Stubs (Automatic):** The Docker build process handles this using `protoc`.

### 5. How to Run
1. **Start all services:**
   ```bash
   docker-compose up --build -d
   ```
2. **Access the Web Dashboard:**
   Open [http://localhost:8081](http://localhost:8081) in your browser.
3. **Test with Terminal Client:**
   ```bash
   docker-compose exec order-service node client.js
   ```
4. **Benchmark (REST vs gRPC):**
   ```bash
   node benchmark.js
   ```

### 6. Project Structure
- `proto/`: Shared `.proto` definitions for all services.
- `order-service/`: Node.js service for order orchestration (Port 50051).
- `inventory-service/`: Node.js service for stock and product management (Port 50052).
- `notification-service/`: Python service for cross-language alerts (Port 50053).
- `envoy/`: Configuration for the gRPC-Web to Native gRPC bridge.
- `frontend/`: Web Dashboard source and gRPC-Web logic.

### 7. Key Features
- **Polyglot Communication:** Seamless binary exchange between Node.js and Python.
- **Glassmorphism UI:** Modern, responsive control panel for microservices.
- **Dynamic Inventory:** Real-time product creation and listing.
- **Real-time Tracking:** Server streaming for order status updates.
- **Error Handling:** Full implementation of gRPC status codes.

### 8. Challenges & Solutions
- **Challenge:** Browsers do not support HTTP/2 trailers required by gRPC.
- **Solution:** Integrated **Envoy Proxy** to translate gRPC-Web requests into native gRPC calls.
- **Challenge:** Sharing `.proto` files across different language containers in Docker.
- **Solution:** Used **Docker Bind Mounts** and multi-stage builds to ensure all services access the same source of truth.

### 9. Resources
- [gRPC Official Documentation](https://grpc.io/docs/)
- [Envoy Proxy gRPC-Web Filter](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_web_filter)
- [Protocol Buffers Language Guide](https://developers.google.com/protocol-buffers/docs/proto3)
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)

### 10. License
Distributed under the MIT License. See `LICENSE` for more information.

---

## <a name="türkçe"></a>🇹🇷 Türkçe

### 1. Proje Adı ve Kısa Açıklama
**gRPC Mikroservis Ekosistemi**
Node.js ve Python ile inşa edilmiş, modern bir Glassmorphism Web Dashboard üzerinden Envoy Proxy aracılığıyla yönetilen, yüksek performanslı poli-glot mikroservis mimarisidir. Gerçek zamanlı veri akışı (streaming) ve diller arası ikili (binary) iletişimi gösterir.

### 2. Ekran Görüntüsü / Demo
![Dashboard Önizleme](https://via.placeholder.com/800x450?text=Glassmorphism+gRPC+Dashboard+Görünümü)
*(Not: Bu alanı localhost:8081 adresindeki ekran görüntünüzle değiştirin)*

### 3. Kullanılan Teknolojiler
- **Backend:** Node.js (Order & Inventory), Python (Notification)
- **İletişim:** gRPC, Protocol Buffers (proto3)
- **Proxy/Gateway:** Envoy Proxy (gRPC-Web dönüşümü)
- **Frontend:** HTML5, Vanilla CSS (Glassmorphism), JavaScript (gRPC-Web istemcisi)
- **Orkestrasyon:** Docker, Docker Compose
- **Araçlar:** Postman (gRPC testi), Webpack (Frontend paketleme)

### 4. Kurulum Adımları
1. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/emrebykdr/gRPC-Microsevices.git
   cd gRPC-Microsevices
   ```
2. **Docker Kurulu Olduğundan Emin Olun:** [docker.com](https://www.docker.com/) adresinden indirebilirsiniz.
3. **Proto Üretimi (Otomatik):** Docker build süreci `protoc` kullanarak dosyaları otomatik üretir.

### 5. Nasıl Çalıştırılır
1. **Tüm servisleri başlatın:**
   ```bash
   docker-compose up --build -d
   ```
2. **Dashboard'a Erişin:**
   Tarayıcınızda [http://localhost:8081](http://localhost:8081) adresini açın.
3. **Terminal İstemcisi ile Test Edin:**
   ```bash
   docker-compose exec order-service node client.js
   ```
4. **Performans Testi (REST vs gRPC):**
   ```bash
   node benchmark.js
   ```

### 6. Proje Yapısı Açıklaması
- `proto/`: Tüm servisler için ortak `.proto` tanımları.
- `order-service/`: Sipariş yönetimi yapan Node.js servisi (Port 50051).
- `inventory-service/`: Stok ve ürün yönetimi yapan Node.js servisi (Port 50052).
- `notification-service/`: Diller arası bildirim gönderen Python servisi (Port 50053).
- `envoy/`: gRPC-Web köprüsü için Envoy konfigürasyonu.
- `frontend/`: Web Dashboard kaynak kodları ve gRPC-Web mantığı.

### 7. Öne Çıkan Özellikler
- **Çok Dilli İletişim:** Node.js ve Python arasında kesintisiz ikili veri değişimi.
- **Glassmorphism Arayüz:** Mikroservisler için modern ve duyarlı kontrol paneli.
- **Dinamik Ürün Yönetimi:** Gerçek zamanlı ürün ekleme ve listeleme.
- **Anlık Takip:** Sipariş durumları için Server Streaming desteği.
- **Hata Yönetimi:** gRPC statü kodlarının tam ölçekli uygulaması.

### 8. Karşılaşılan Zorluklar ve Çözümler
- **Zorluk:** Tarayıcıların gRPC için gereken HTTP/2 Trailers özelliğini desteklememesi.
- **Çözüm:** gRPC-Web isteklerini standart gRPC çağrılarına dönüştüren **Envoy Proxy** entegre edildi.
- **Zorluk:** Farklı dillerdeki Docker konteynerleri arasında `.proto` dosyalarının paylaşılması.
- **Çözüm:** **Docker Bind Mounts** ve çok aşamalı (multi-stage) build yapısı kullanılarak tüm servislerin aynı şemaya erişimi sağlandı.

### 9. Kaynaklar
- [gRPC Resmi Dokümantasyonu](https://grpc.io/docs/)
- [Envoy Proxy gRPC-Web Filtresi](https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/grpc_web_filter)
- [Protocol Buffers Rehberi](https://developers.google.com/protocol-buffers/docs/proto3)
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)

### 10. Lisans
MIT Lisansı altında dağıtılmaktadır. Daha fazla bilgi için `LICENSE` dosyasına bakınız.
