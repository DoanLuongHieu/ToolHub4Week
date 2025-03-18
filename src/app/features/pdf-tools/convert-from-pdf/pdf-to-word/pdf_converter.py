import os
import tempfile
from pdf2docx import Converter
import pdfplumber
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PDFToWordConverter:
    """
    Lớp chuyển đổi file PDF sang định dạng Word sử dụng pdf-plumber để đọc nội dung
    và pdf2docx để chuyển đổi.
    """
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
    
    def extract_text_with_pdfplumber(self, pdf_path):
        """Trích xuất text từ PDF bằng pdfplumber để kiểm tra trước khi chuyển đổi"""
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                logger.info(f"PDF có {len(pdf.pages)} trang")
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text.strip()
        except Exception as e:
            logger.error(f"Lỗi khi trích xuất text từ PDF: {str(e)}")
            raise Exception(f"Không thể đọc file PDF: {str(e)}")
    
    def convert_pdf_to_docx(self, pdf_path, output_path=None):
        """
        Chuyển đổi PDF sang Word (DOCX)
        
        Args:
            pdf_path (str): Đường dẫn đến file PDF
            output_path (str, optional): Đường dẫn lưu file DOCX. Nếu không cung cấp,
                                         sẽ tạo file ở cùng thư mục với tên giống PDF
        
        Returns:
            str: Đường dẫn đến file DOCX đã tạo
        """
        try:
            # Kiểm tra trước với pdfplumber
            text_content = self.extract_text_with_pdfplumber(pdf_path)
            if not text_content:
                logger.warning("PDF không chứa text có thể trích xuất được")
            
            # Xác định output path nếu không được cung cấp
            if not output_path:
                pdf_filename = os.path.basename(pdf_path)
                docx_filename = os.path.splitext(pdf_filename)[0] + '.docx'
                output_path = os.path.join(os.path.dirname(pdf_path), docx_filename)
            
            # Thực hiện chuyển đổi
            logger.info(f"Bắt đầu chuyển đổi PDF thành DOCX: {pdf_path} -> {output_path}")
            cv = Converter(pdf_path)
            cv.convert(output_path)
            cv.close()
            
            logger.info(f"Chuyển đổi hoàn tất: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Lỗi trong quá trình chuyển đổi: {str(e)}")
            raise Exception(f"Không thể chuyển đổi PDF sang Word: {str(e)}")

# Hàm tiện ích để sử dụng nhanh
def convert_pdf_to_word(pdf_path, output_path=None):
    """Hàm trợ giúp để chuyển đổi PDF sang Word"""
    converter = PDFToWordConverter()
    return converter.convert_pdf_to_docx(pdf_path, output_path)

if __name__ == "__main__":
    # Thử nghiệm nếu chạy trực tiếp file này
    import sys
    if len(sys.argv) > 1:
        pdf_file = sys.argv[1]
        output_file = sys.argv[2] if len(sys.argv) > 2 else None
        try:
            result = convert_pdf_to_word(pdf_file, output_file)
            print(f"Chuyển đổi thành công. File Word đã được lưu tại: {result}")
        except Exception as e:
            print(f"Lỗi: {str(e)}")
            sys.exit(1)
    else:
        print("Sử dụng: python pdf_converter.py [đường_dẫn_file_pdf] [đường_dẫn_file_docx_output (tùy chọn)]") 