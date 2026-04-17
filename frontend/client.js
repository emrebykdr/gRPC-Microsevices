const { CreateOrderRequest, TrackOrderRequest, ChatMessage } = require('./generated/order_pb.js');
const { OrderServiceClient } = require('./generated/order_grpc_web_pb.js');

const { CheckStockRequest, ReduceStockRequest, ListProductsRequest, AddProductRequest } = require('./generated/inventory_pb.js');
const { InventoryServiceClient } = require('./generated/inventory_grpc_web_pb.js');

const { SendNotificationRequest } = require('./generated/notification_pb.js');
const { NotificationServiceClient } = require('./generated/notification_grpc_web_pb.js');

// Clients
const ENVOY_URL = 'http://localhost:8080';
const orderClient = new OrderServiceClient(ENVOY_URL);
const inventoryClient = new InventoryServiceClient(ENVOY_URL);
const notificationClient = new NotificationServiceClient(ENVOY_URL);

// Helper for UI logging
function addLog(message, type = 'system') {
    const viewport = document.getElementById('log-viewport');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    entry.innerText = `[${time}] ${message}`;
    viewport.appendChild(entry);
    viewport.scrollTop = viewport.scrollHeight;
}

function updateResult(id, message, isError = false) {
    const el = document.getElementById(id);
    el.innerText = message;
    el.style.color = isError ? "#fca5a5" : "#94a3b8";
}

// --- Order Service Functions ---

window.createOrder = function() {
    const prodId = document.getElementById('order-product-id').value;
    const qty = parseInt(document.getElementById('order-quantity').value);
    const custId = document.getElementById('order-customer-id').value;

    const request = new CreateOrderRequest();
    request.setProductId(prodId);
    request.setQuantity(qty);
    request.setCustomerId(custId);

    updateResult('order-result', "İşleniyor...");
    addLog(`Sipariş oluşturuluyor: ${prodId} (Miktar: ${qty})`, 'system');

    orderClient.createOrder(request, {}, (err, response) => {
        if (err) {
            updateResult('order-result', `Hata: ${err.message}`, true);
            addLog(`Sipariş Hatası: ${err.message}`, 'error');
        } else {
            const msg = `Başarılı! ID: ${response.getOrderId()} - ${response.getMessage()}`;
            updateResult('order-result', msg);
            addLog(`Sipariş Onaylandı: ${response.getOrderId()}`, 'success');
        }
    });
};

window.trackOrder = function() {
    const orderId = prompt("İzlenecek Sipariş ID girin:", "ORD-123");
    if (!orderId) return;

    const request = new TrackOrderRequest();
    request.setOrderId(orderId);

    addLog(`Sipariş takibi başlatıldı: ${orderId}`, 'streaming');
    
    const stream = orderClient.trackOrder(request, {});
    
    stream.on('data', (response) => {
        const status = response.getStatus();
        const detail = response.getDetail();
        addLog(`[TRACK] ${orderId}: ${status} - ${detail}`, 'streaming');
    });

    stream.on('error', (err) => {
        addLog(`[TRACK] Hata: ${err.message}`, 'error');
    });

    stream.on('end', () => {
        addLog(`[TRACK] Akış tamamlandı.`, 'system');
    });
};

// Not: gRPC-Web client streaming ve bidi streaming için özel proxy desteği gerekir.
// Envoy yapılandırmasına göre bunlar çalışmayabilir ama kod yapısı bu şekildedir.
window.bulkCreate = function() {
    addLog("Bulk Create (Client Streaming) gRPC-Web'de sınırlı desteklenir.", "error");
};

window.liveChat = function() {
    addLog("Live Chat (Bidi Streaming) gRPC-Web'de sınırlı desteklenir.", "error");
};

// --- Inventory Service Functions ---

window.checkStock = function() {
    const prodId = document.getElementById('inventory-product-id').value;
    const request = new CheckStockRequest();
    request.setProductId(prodId);

    updateResult('inventory-result', "Kontrol ediliyor...");
    
    inventoryClient.checkStock(request, {}, (err, response) => {
        if (err) {
            updateResult('inventory-result', `Hata: ${err.message}`, true);
            addLog(`Stok Kontrol Hatası: ${err.message}`, 'error');
        } else {
            const stock = response.getAvailableQuantity();
            const inStock = response.getInStock() ? "VAR" : "YOK";
            const msg = `Stok: ${stock} (${inStock})`;
            updateResult('inventory-result', msg);
            addLog(`Stok Bilgisi: ${prodId} -> ${stock}`, 'success');
        }
    });
};

window.reduceStock = function() {
    const prodId = document.getElementById('inventory-product-id').value;
    const request = new ReduceStockRequest();
    request.setProductId(prodId);
    request.setQuantity(1); // Varsayılan 1

    updateResult('inventory-result', "Düşürülüyor...");

    inventoryClient.reduceStock(request, {}, (err, response) => {
        if (err) {
            updateResult('inventory-result', `Hata: ${err.message}`, true);
            addLog(`Stok Düşme Hatası: ${err.message}`, 'error');
        } else {
            const msg = `Başarılı! Kalan: ${response.getRemainingStock()}`;
            updateResult('inventory-result', msg);
            addLog(`Stok Düşürüldü: ${prodId}`, 'success');
        }
    });
};

window.listProducts = function() {
    const request = new ListProductsRequest();
    const grid = document.getElementById('product-grid');

    inventoryClient.listProducts(request, {}, (err, response) => {
        if (err) {
            addLog(`Ürün listeleme hatası: ${err.message}`, 'error');
            grid.innerHTML = `<div class="error-msg">Liste yüklenemedi: ${err.message}</div>`;
        } else {
            const products = response.getProductsList();
            grid.innerHTML = '';
            
            products.forEach(p => {
                const item = document.createElement('div');
                item.className = 'product-item';
                const qty = p.getQuantity();
                const stockStatus = qty > 0 ? 'in-stock' : 'out-of-stock';
                const stockText = qty > 0 ? `${qty} Adet` : 'Tükendi';

                item.innerHTML = `
                    <div class="product-info">
                        <h4>${p.getName()}</h4>
                        <span class="product-id">${p.getProductId()}</span>
                    </div>
                    <div class="product-stats">
                        <span class="price">$${p.getPrice().toFixed(2)}</span>
                        <span class="stock-tag ${stockStatus}">${stockText}</span>
                    </div>
                `;
                grid.appendChild(item);
            });
            addLog("Ürün listesi güncellendi.", "success");
        }
    });
};

window.addProduct = function() {
    const id = document.getElementById('add-product-id').value;
    const name = document.getElementById('add-product-name').value;
    const qty = parseInt(document.getElementById('add-product-qty').value);
    const price = parseFloat(document.getElementById('add-product-price').value);

    if (!id || !name) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    const request = new AddProductRequest();
    request.setProductId(id);
    request.setName(name);
    request.setQuantity(qty);
    request.setPrice(price);

    updateResult('add-product-result', "Ekleniyor...");

    inventoryClient.addProduct(request, {}, (err, response) => {
        if (err) {
            updateResult('add-product-result', `Hata: ${err.message}`, true);
            addLog(`Ürün Ekleme Hatası: ${err.message}`, 'error');
        } else {
            updateResult('add-product-result', response.getMessage());
            addLog(`Yeni ürün eklendi: ${name}`, 'success');
            // Listeyi yenile
            window.listProducts();
            // Formu temizle
            document.getElementById('add-product-id').value = '';
            document.getElementById('add-product-name').value = '';
        }
    });
};

// --- Notification Service Functions ---

window.sendNotification = function() {
    const custId = document.getElementById('notif-customer-id').value;
    const message = document.getElementById('notif-message').value;

    const request = new SendNotificationRequest();
    request.setCustomerId(custId);
    request.setMessage(message);
    request.setType("MANUAL_TEST");

    updateResult('notification-result', "Gönderiliyor...");

    notificationClient.sendNotification(request, {}, (err, response) => {
        if (err) {
            updateResult('notification-result', `Hata: ${err.message}`, true);
            addLog(`Bildirim Hatası: ${err.message}`, 'error');
        } else {
            const msg = `Gönderildi! ID: ${response.getNotificationId()}`;
            updateResult('notification-result', msg);
            addLog(`Bildirim Başarılı: ${response.getNotificationId()}`, 'success');
        }
    });
};

window.clearLogs = function() {
    document.getElementById('log-viewport').innerHTML = '';
    addLog("Sistem hazır. Lütfen bir işlem seçin.");
};

// Initial log
addLog("Sistem hazır. Lütfen bir işlem seçin.");
window.listProducts();
