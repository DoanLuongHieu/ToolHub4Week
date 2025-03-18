# ToolHub4Week - Ứng dụng Đa Công cụ Xử lý Tài liệu & Dữ liệu

ToolHub4Week là một ứng dụng web toàn diện cung cấp nhiều công cụ hữu ích để xử lý tài liệu, hình ảnh và các tác vụ tiện ích khác. Dự án được xây dựng trên Angular và Firebase, cung cấp giao diện người dùng hiện đại và trải nghiệm liền mạch cho người dùng.

## Tính năng chính

### 1. Công cụ PDF
- **Chuyển đổi từ PDF**
  - PDF sang Word
  - PDF sang Excel
- **Chuyển đổi sang PDF**
  - Word sang PDF
  - Excel sang PDF
- **Tổ chức**
  - Nén PDF
  - Tách PDF
  - Gộp PDF

### 2. Công cụ Hình ảnh
- **Chuyển đổi**
  - Chuyển đổi giữa các định dạng hình ảnh
- **Chỉnh sửa**
  - Nén hình ảnh
  - Đọc thông tin EXIF
  - Cắt hình ảnh
  - Đóng khung hình ảnh

### 3. Công cụ khác
- **Tạo**
  - Tạo mật khẩu
  - Tạo Lorem Ipsum
- **Công cụ JavaScript**
  - JSON sang CSV
  - CSV sang JSON
- **Công cụ Toán học**
  - Phân tích số học

### 4. Quản lý tài khoản
- Đăng ký/Đăng nhập
- Xác thực qua Google
- Quản lý hồ sơ cá nhân

## Công nghệ sử dụng

- **Frontend**: Angular 17, TypeScript, RxJS
- **UI/UX**: CSS/SCSS, Responsive Design
- **Backend**: Firebase (Authentication, Hosting)
- **Thư viện**: pdf-lib, pdfjs-dist, cropperjs, exifr, file-saver

## Yêu cầu cài đặt
- Node.js (phiên bản 18.x hoặc cao hơn)
- npm (phiên bản 9.x hoặc cao hơn)
- Python (phiên bản 3.9 hoặc cao hơn)
- Angular CLI (phiên bản 17.x)
- Git

## Hướng dẫn cài đặt

### 1. Clone repository từ GitHub
```bash
git clone https://github.com/DoanLuongHieu/ToolHub4Week.git
cd ToolHub4Week
```

### 2. Cài đặt dependencies cho Frontend (Angular)
```bash
npm install
```

### 3. Cài đặt môi trường ảo Python và dependencies
```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
# source venv/bin/activate

# Cài đặt các thư viện Python
pip install -r src/requirements.txt
```

### 4. Cấu hình Firebase

Dự án đã được cấu hình với Firebase, nhưng bạn cần thiết lập Authentication:

1. Đăng nhập vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn dự án "toolhub4week"
3. Trong menu bên trái, chọn "Authentication"
4. Chọn tab "Sign-in method"
5. Kích hoạt phương thức đăng nhập "Google"
6. Thêm domain của trang web nơi triển khai ứng dụng vào "Authorized domains"

Xem thêm chi tiết tại: [FIREBASE_SETUP_GUIDE.txt](./src/FIREBASE_SETUP_GUIDE.txt)

### 5. Chạy ứng dụng trong môi trường phát triển
```bash
npm start
```
Truy cập ứng dụng tại `http://localhost:4200/`

### 6. Build cho môi trường production
```bash
npm run build
```

### 7. Triển khai lên Firebase Hosting
```bash
# Cài đặt Firebase CLI nếu chưa có
npm install -g firebase-tools

# Đăng nhập vào Firebase
firebase login

# Triển khai ứng dụng
firebase deploy
```

## Cấu trúc dự án

- `/src/app/features`: Chứa các module tính năng chính
- `/src/app/shared`: Components, services dùng chung
- `/src/app/core`: Services cốt lõi, interceptors, và handlers
- `/src/assets`: Tài nguyên tĩnh (hình ảnh, fonts)
- `/src/environments`: Cấu hình môi trường

## Demo

Link: [ToolHub4Week](https://toolhub4week.web.app/)

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## Giấy phép

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

