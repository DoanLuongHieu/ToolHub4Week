from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import uuid
import time
from werkzeug.utils import secure_filename
from pdf_converter import convert_pdf_to_word
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Cho phép tất cả các origin truy cập API

# Thư mục để lưu trữ file tạm thời
# Trên các dịch vụ cloud, thường chỉ /tmp là writable
if os.environ.get('PRODUCTION') == 'true':
    BASE_TEMP_DIR = '/tmp'
else:
    BASE_TEMP_DIR = tempfile.gettempdir()

UPLOAD_FOLDER = os.path.join(BASE_TEMP_DIR, 'pdf_to_word_uploads')
OUTPUT_FOLDER = os.path.join(BASE_TEMP_DIR, 'pdf_to_word_output')

# Tạo thư mục nếu chưa tồn tại
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Định kỳ xóa các file tạm cũ
def cleanup_old_files(directory, max_age=3600):  # 1 giờ
    """Xóa các file cũ hơn max_age giây"""
    now = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path) and now - os.path.getmtime(file_path) > max_age:
            try:
                os.remove(file_path)
                logger.info(f"Đã xóa file cũ: {file_path}")
            except Exception as e:
                logger.warning(f"Không thể xóa file cũ {file_path}: {str(e)}")

@app.before_request
def before_request():
    """Chạy trước mỗi request để dọn dẹp file tạm"""
    if request.endpoint != 'static':
        cleanup_old_files(UPLOAD_FOLDER)
        cleanup_old_files(OUTPUT_FOLDER)

@app.route('/api/convert-pdf-to-word', methods=['POST'])
def api_convert_pdf_to_word():
    """API endpoint để chuyển đổi PDF sang Word"""
    try:
        # Kiểm tra xem có nhận được file không
        if 'file' not in request.files:
            return jsonify({'error': 'Không tìm thấy file'}), 400
        
        file = request.files['file']
        
        # Kiểm tra xem file có tên không
        if file.filename == '':
            return jsonify({'error': 'Không có file nào được chọn'}), 400
        
        # Kiểm tra phần mở rộng của file
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Chỉ hỗ trợ file PDF'}), 400
        
        # Kiểm tra kích thước file (giới hạn 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if request.content_length > max_size:
            return jsonify({'error': 'Kích thước file vượt quá giới hạn 10MB'}), 400
        
        # Tạo tên file duy nhất để tránh xung đột
        unique_filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
        pdf_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Lưu file PDF đã tải lên
        file.save(pdf_path)
        logger.info(f"Đã lưu file tại: {pdf_path}")
        
        # Xác định đường dẫn output
        docx_filename = os.path.splitext(unique_filename)[0] + '.docx'
        docx_path = os.path.join(OUTPUT_FOLDER, docx_filename)
        
        # Thực hiện chuyển đổi
        convert_pdf_to_word(pdf_path, docx_path)
        logger.info(f"Đã chuyển đổi thành công: {docx_path}")
        
        # Trả về file Word
        return send_file(
            docx_path,
            as_attachment=True,
            download_name=os.path.splitext(file.filename)[0] + '.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        
    except Exception as e:
        logger.error(f"Lỗi: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # Xóa file tạm sau khi xử lý xong (tùy chọn)
        try:
            if 'pdf_path' in locals() and os.path.exists(pdf_path):
                os.remove(pdf_path)
            if 'docx_path' in locals() and os.path.exists(docx_path):
                os.remove(docx_path)
        except Exception as cleanup_error:
            logger.warning(f"Không thể xóa file tạm: {str(cleanup_error)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """API endpoint kiểm tra trạng thái máy chủ"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    # Chạy server khi gọi trực tiếp file này
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'false').lower() == 'true') 