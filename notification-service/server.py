import time
from concurrent import futures
import uuid
import grpc
from grpc_health.v1 import health_pb2, health_pb2_grpc, health
from grpc_reflection.v1alpha import reflection

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "generated"))

import notification_pb2
import notification_pb2_grpc

class NotificationServiceServicer(notification_pb2_grpc.NotificationServiceServicer):
    def SendNotification(self, request, context):
        notif_id = f"NOTIF-{uuid.uuid4().hex[:8].upper()}"
        print(f"[NOTIFICATION] {request.type} -> Customer: {request.customer_id}", flush=True)
        print(f"[NOTIFICATION] Message: {request.message}", flush=True)
        return notification_pb2.SendNotificationResponse(
            success=True, notification_id=notif_id
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    notification_pb2_grpc.add_NotificationServiceServicer_to_server(NotificationServiceServicer(), server)
    
    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)

    health_servicer.set("notification.NotificationService", health_pb2.HealthCheckResponse.SERVING)
    health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)

    # gRPC Server Reflection — grpcurl'ün proto dosyasına gerek kalmadan çalışmasını sağlar
    service_names = (
        notification_pb2.DESCRIPTOR.services_by_name['NotificationService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(service_names, server)

    server.add_insecure_port('[::]:50053')
    server.start()
    print("Notification Service started on port 50053", flush=True)
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
