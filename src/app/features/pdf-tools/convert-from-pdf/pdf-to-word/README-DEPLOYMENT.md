# Hướng dẫn Triển khai Backend PDF-to-Word lên Môi trường Production

Tài liệu này hướng dẫn cách triển khai backend Flask của công cụ chuyển đổi PDF sang Word lên môi trường production. Chúng ta sẽ sử dụng Render.com làm dịch vụ hosting, vì nó có gói miễn phí và dễ cấu hình.

## Giải pháp 1: Triển khai với Render.com (Khuyến nghị)

### Chuẩn bị

1. Đăng ký tài khoản Render.com (miễn phí) tại: https://render.com/
2. Đảm bảo bạn đã có tất cả các file sau trong thư mục `src/app/features/pdf-tools/convert-from-pdf/pdf-to-word/`:
   - api.py
   - pdf_converter.py
   - requirements.txt
   - wsgi.py
   - render.yaml

### Các bước triển khai

1. **Tạo repository Git**

   Trước tiên, tạo một repository Git và đẩy code của bạn lên đó (GitHub, GitLab, v.v.)

2. **Kết nối với Render**

   - Đăng nhập vào tài khoản Render
   - Chọn "New" > "Web Service"
   - Kết nối với repository Git của bạn

3. **Cấu hình dịch vụ**

   - Đặt tên cho dịch vụ, ví dụ: "pdf-to-word-api"
   - Chọn Runtime: "Python 3"
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`
   - Chọn plan "Free"

4. **Cấu hình biến môi trường**

   Thêm các biến môi trường sau:
   - `PRODUCTION`: true
   - `DEBUG`: false
   - `PORT`: 10000 (Render sẽ tự động ghi đè cổng này)

5. **Triển khai**

   Nhấn "Create Web Service" và đợi quá trình triển khai hoàn tất

6. **Cập nhật URL API trong Angular**

   Sau khi triển khai thành công, Render sẽ cấp cho bạn một URL, ví dụ: `https://pdf-to-word-api.onrender.com`
   
   Cập nhật URL này trong file `environments/environment.ts`:
   ```typescript
   pdfToWordApiUrl: 'https://pdf-to-word-api.onrender.com/api'
   ```

## Giải pháp 2: PythonAnywhere

PythonAnywhere cũng là một lựa chọn tốt với gói miễn phí.

### Các bước triển khai

1. Đăng ký tài khoản tại: https://www.pythonanywhere.com/

2. Tải tệp dự án lên:
   - Từ Dashboard, chọn "Files" và tải lên các file cần thiết
   - Hoặc sử dụng lệnh Git để clone repository

3. Thiết lập môi trường ảo và cài đặt các phụ thuộc:
   ```bash
   mkvirtualenv --python=python3.9 pdf2word
   pip install -r requirements.txt
   ```

4. Thiết lập WSGI và Web App:
   - Từ Dashboard, chọn "Web" và tạo ứng dụng web mới
   - Chọn "Manual Configuration" và Python 3.9
   - Cập nhật file WSGI với đường dẫn đến wsgi.py

5. Cập nhật URL trong ứng dụng Angular.

## Giải pháp 3: Railway.app

Railway cung cấp gói miễn phí với giới hạn sử dụng hằng tháng.

### Các bước triển khai

1. Đăng ký tại: https://railway.app/

2. Tạo dự án mới và liên kết với repository GitHub

3. Cấu hình biến môi trường tương tự như Render

4. Triển khai tự động khi đẩy code lên GitHub

## Lưu ý khi triển khai

1. **Quản lý file tạm thời**:
   - Hầu hết các dịch vụ hosting chỉ cho phép ghi vào thư mục `/tmp`
   - Các file tạm sẽ bị xóa khi container khởi động lại
   - API đã được cập nhật để xử lý vấn đề này

2. **Giới hạn kích thước file**:
   - Các dịch vụ miễn phí thường có giới hạn về kích thước request
   - API đã được cấu hình để giới hạn file 10MB

3. **Ứng dụng ngủ đông**:
   - Các gói miễn phí thường cho phép ứng dụng "ngủ đông" sau một thời gian không hoạt động
   - Có thể cần một dịch vụ "ping" để giữ cho ứng dụng luôn hoạt động

4. **CORS**:
   - API đã được cấu hình để chấp nhận tất cả các nguồn gốc (Cross-Origin)
   - Trong môi trường production, bạn nên giới hạn CORS chỉ cho tên miền của ứng dụng Angular

## Khắc phục sự cố

1. **Ứng dụng Flask không hoạt động**:
   - Kiểm tra logs trong dashboard của nhà cung cấp dịch vụ
   - Đảm bảo rằng tất cả các thư viện đã được cài đặt

2. **Lỗi khi chuyển đổi PDF**:
   - Kiểm tra xem thư mục tạm có được tạo và có quyền ghi không
   - Đảm bảo PDF không vượt quá giới hạn kích thước

3. **Lỗi CORS**:
   - Đảm bảo rằng URL API trong Angular chính xác
   - Kiểm tra cấu hình CORS trong ứng dụng Flask 