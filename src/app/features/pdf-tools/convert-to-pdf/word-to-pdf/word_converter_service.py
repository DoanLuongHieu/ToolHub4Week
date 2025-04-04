from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import tempfile
import io

app = Flask(__name__)
CORS(app)

# Đăng ký font Unicode để hỗ trợ tiếng Việt
pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/api/convert-word-to-pdf', methods=['POST'])
def convert_word_to_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Không tìm thấy file'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Không có file được chọn'}), 400

        if not file.filename.endswith(('.doc', '.docx')):
            return jsonify({'error': 'Định dạng file không được hỗ trợ'}), 400

        # Đọc file Word
        doc = Document(file)
        
        # Tạo file PDF tạm thời
        pdf_buffer = io.BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        c.setFont('DejaVuSans', 12)

        # Chuyển đổi nội dung
        y = 750  # Vị trí y ban đầu
        for paragraph in doc.paragraphs:
            # Xử lý text với font Unicode
            text = paragraph.text
            if text.strip():  # Chỉ xử lý đoạn văn có nội dung
                # Tách text thành các dòng để tránh tràn trang
                words = text.split()
                line = []
                for word in words:
                    line.append(word)
                    if len(' '.join(line)) > 80:  # Giới hạn độ dài mỗi dòng
                        c.drawString(50, y, ' '.join(line[:-1]))
                        line = [word]
                        y -= 20  # Khoảng cách giữa các dòng
                
                if line:  # Vẽ dòng cuối cùng
                    c.drawString(50, y, ' '.join(line))
                    y -= 20

                # Kiểm tra và tạo trang mới nếu cần
                if y < 50:
                    c.showPage()
                    c.setFont('DejaVuSans', 12)
                    y = 750

        c.save()
        pdf_buffer.seek(0)

        # Gửi file PDF về client
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=os.path.splitext(file.filename)[0] + '.pdf'
        )

    except Exception as e:
        print(f"Lỗi chuyển đổi: {str(e)}")
        return jsonify({'error': 'Lỗi chuyển đổi file'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 