# Công cụ chuyển đổi PDF sang Word

Công cụ này cho phép chuyển đổi tài liệu PDF sang định dạng Word (.docx) sử dụng Python backend kết hợp với giao diện Angular.

## Yêu cầu hệ thống

- Node.js và npm (cho Angular frontend)
- Python 3.7+ (cho backend)
- pip (trình quản lý gói Python)

## Cài đặt

### Backend (Python)

1. Từ thư mục gốc của dự án, di chuyển đến thư mục backend Python:

```bash
cd src/app/features/pdf-tools/convert-from-pdf/pdf-to-word
```

2. Cài đặt các thư viện Python cần thiết:

```bash
pip install -r requirements.txt
```

Quá trình này sẽ cài đặt các thư viện:
- flask và flask-cors: để tạo API REST
- pdfplumber: để đọc và phân tích PDF
- pdf2docx: để chuyển đổi PDF sang DOCX
- werkzeug: để xử lý tệp an toàn
- gunicorn: cho triển khai sản xuất (tùy chọn)

3. Chạy server Flask:

```bash
python api.py
```

Server sẽ chạy tại địa chỉ http://localhost:5000.

### Frontend (Angular)

Frontend Angular đã được tích hợp vào ứng dụng hiện có. Để sử dụng:

1. Đảm bảo đã cài đặt các dependencies của dự án:

```bash
npm install
```

2. Chạy ứng dụng Angular:

```bash
ng serve
```

Ứng dụng sẽ chạy tại địa chỉ http://localhost:4200.

## Cách sử dụng

1. Truy cập trang chuyển đổi PDF sang Word trong ứng dụng
2. Kéo và thả file PDF hoặc nhấp vào nút "Chọn file PDF" để tải lên
3. Nhấp vào nút "Chuyển đổi sang Word"
4. Đợi quá trình chuyển đổi hoàn tất, file DOCX sẽ tự động tải xuống

## Cấu trúc thư mục

```
pdf-to-word/
├── api.py                 # Flask API server
├── pdf_converter.py       # Mã xử lý chuyển đổi PDF sang Word
├── requirements.txt       # Các thư viện Python cần thiết
├── README.md              # Tài liệu hướng dẫn này
├── pdf-to-word.component.ts    # Angular component TypeScript
├── pdf-to-word.component.html  # Template HTML
└── pdf-to-word.component.css   # Styles CSS
```

## Lưu ý kỹ thuật

- Backend sử dụng Flask để cung cấp API REST đơn giản
- Thư viện pdf-plumber được sử dụng để trích xuất và phân tích text từ PDF
- Thư viện pdf2docx xử lý phần chuyển đổi từ PDF sang DOCX
- Giao diện người dùng được xây dựng với Angular
- Angular HttpClient được sử dụng để giao tiếp với API backend

## Xử lý lỗi

Nếu gặp lỗi "Máy chủ chuyển đổi PDF hiện không khả dụng", hãy đảm bảo:

1. Server Flask đang chạy
2. Không có tường lửa chặn kết nối giữa frontend và backend
3. Địa chỉ API trong `pdf-conversion.service.ts` đúng (mặc định là `http://localhost:5000/api`)

## Chế độ phát triển

Để phát triển và mở rộng công cụ này, bạn có thể:

1. Thêm các tùy chọn chuyển đổi như chọn định dạng, bảo tồn hình ảnh, v.v.
2. Cải thiện xử lý lỗi và thông báo cho người dùng
3. Tối ưu hóa quá trình chuyển đổi cho các file PDF lớn 

# PDF to Word Converter API

Dịch vụ API chuyển đổi file PDF sang Word (DOCX).

## Triển khai trên Railway.app

### Các bước triển khai:

1. Đăng ký tài khoản trên [Railway.app](https://railway.app/)
2. Cài đặt Railway CLI: `npm i -g @railway/cli`
3. Đăng nhập vào Railway: `railway login`
4. Khởi tạo project: `railway init`
5. Triển khai ứng dụng: `railway up`

### Hoặc triển khai qua Github:

1. Đăng nhập vào [Railway.app](https://railway.app/) bằng tài khoản Github
2. Tạo New Project -> Deploy from GitHub repo
3. Chọn repository của bạn
4. Railway sẽ tự động detect các cấu hình và triển khai ứng dụng

### Biến môi trường (không bắt buộc):

- `PORT`: Port để chạy ứng dụng (mặc định: 5000)

## API Endpoints

- `POST /api/convert-pdf-to-word`: Chuyển đổi PDF sang Word
- `GET /api/health`: Kiểm tra trạng thái API

## Lưu ý

- API này sử dụng Flask và gunicorn để phục vụ requests
- Các dependencies sẽ được tự động cài đặt từ file requirements.txt 