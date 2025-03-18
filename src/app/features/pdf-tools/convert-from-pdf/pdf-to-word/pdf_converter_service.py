import subprocess
import sys
import os
import time
import logging
from pathlib import Path

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pdf_converter_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PDFConverterService:
    def __init__(self):
        self.process = None
        self.api_path = Path(__file__).parent / 'api.py'
        self.requirements_path = Path(__file__).parent / 'requirements.txt'
        
    def install_requirements(self):
        """Cài đặt các dependencies từ requirements.txt"""
        try:
            logger.info("Đang cài đặt dependencies...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(self.requirements_path)])
            logger.info("Cài đặt dependencies thành công!")
        except subprocess.CalledProcessError as e:
            logger.error(f"Lỗi khi cài đặt dependencies: {e}")
            raise

    def start_service(self):
        """Khởi động service"""
        try:
            if not self.process:
                logger.info("Đang khởi động PDF Converter Service...")
                self.process = subprocess.Popen(
                    [sys.executable, str(self.api_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                logger.info(f"Service đã khởi động với PID: {self.process.pid}")
        except Exception as e:
            logger.error(f"Lỗi khi khởi động service: {e}")
            raise

    def stop_service(self):
        """Dừng service"""
        if self.process:
            logger.info("Đang dừng PDF Converter Service...")
            self.process.terminate()
            self.process.wait()
            self.process = None
            logger.info("Service đã dừng")

    def restart_service(self):
        """Khởi động lại service"""
        self.stop_service()
        time.sleep(2)  # Đợi service dừng hoàn toàn
        self.start_service()

    def is_running(self):
        """Kiểm tra service có đang chạy không"""
        return self.process is not None and self.process.poll() is None

def main():
    service = PDFConverterService()
    
    try:
        # Cài đặt dependencies
        service.install_requirements()
        
        # Khởi động service
        service.start_service()
        
        # Giữ service chạy
        while True:
            if not service.is_running():
                logger.warning("Service đã dừng, đang khởi động lại...")
                service.restart_service()
            time.sleep(5)  # Kiểm tra mỗi 5 giây
            
    except KeyboardInterrupt:
        logger.info("Đang dừng service...")
        service.stop_service()
    except Exception as e:
        logger.error(f"Lỗi không mong muốn: {e}")
        service.stop_service()
        raise

if __name__ == "__main__":
    main() 