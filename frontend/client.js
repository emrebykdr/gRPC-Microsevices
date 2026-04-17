const { CreateOrderRequest } = require('./generated/order_pb.js');
const { OrderServiceClient } = require('./generated/order_grpc_web_pb.js');

const client = new OrderServiceClient('http://localhost:8080');

window.createOrder = function() {
  const request = new CreateOrderRequest();
  request.setProductId("PROD-WEB-1");
  request.setQuantity(2);
  request.setCustomerId("CUST-BROWSER");

  document.getElementById('result').innerText = "Yükleniyor...";

  client.createOrder(request, {}, (err, response) => {
    const el = document.getElementById('result');
    if (err) {
      el.innerText = `Hata: ${err.message} (Kod: ${err.code})`;
      el.style.color = "red";
    } else {
      el.innerText = `Başarılı! Order ID: ${response.getOrderId()} - ${response.getMessage()}`;
      el.style.color = "green";
    }
  });
};
