FROM python:3.11-slim
WORKDIR /app
COPY notification-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY proto /proto
COPY notification-service/generate_pb.sh .
RUN mkdir -p generated && bash generate_pb.sh
COPY notification-service/ .
EXPOSE 50053
CMD ["python", "server.py"]
