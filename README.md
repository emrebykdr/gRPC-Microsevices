# gRPC Microservices Demo

Node.js + Python | gRPC + Protobuf | Docker Compose

## Servisler

| Servis | Dil | Port |
|---|---|---|
| Order Service | Node.js | 50051 |
| Inventory Service | Node.js | 50052 |
| Notification Service | Python | 50053 |

## Hızlı Başlangıç

```bash
# Tüm servisleri ayağa kaldır
docker-compose up --build

# Test et
node order-service/client.js
```

## Aşamalar

- [x] Aşama 1: Proje İskeleti ve Altyapı
- [ ] Aşama 2: Protocol Buffers (.proto) Dosyaları
- [ ] Aşama 3: Servis Implementasyonları
- [ ] Aşama 4: Error Handling & Health Check
- [ ] Aşama 5: Docker & Orkestrasyon
- [ ] Aşama 6: Test ve Doğrulama
