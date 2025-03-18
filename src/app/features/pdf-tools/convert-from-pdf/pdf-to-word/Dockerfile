FROM python:3.9-slim

WORKDIR /app

# Cài đặt các phụ thuộc hệ thống cần thiết
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Sao chép tệp yêu cầu và cài đặt các phụ thuộc Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn
COPY pdf_converter.py .
COPY api.py .

# Mở cổng cho Flask API
EXPOSE 5000

# Chạy ứng dụng bằng Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "api:app"] 