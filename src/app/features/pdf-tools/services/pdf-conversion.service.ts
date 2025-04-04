import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Đảm bảo worker của pdfjs được tải
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

@Injectable({
  providedIn: 'root',
})
export class PdfConversionService {
  private readonly apiUrl = '/api';

  constructor(private http: HttpClient) {}

  async convertPdfToExcel(
    file: File,
    outputFormat: 'xlsx' | 'csv'
  ): Promise<File> {
    try {
      // Đọc file PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      
      // Tải PDF document
      const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const numPages = pdfDocument.numPages;
      
      // Tạo workbook Excel
      const workbook = XLSX.utils.book_new();
      
      // Xử lý từng trang PDF
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Chuyển đổi nội dung văn bản thành dữ liệu bảng
        const tableData = this.extractTableData(textContent, page.view);
        
        // Tạo worksheet từ dữ liệu bảng
        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
      }
      
      // Tạo dữ liệu binary
      const excelData = outputFormat === 'xlsx' 
        ? XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) 
        : XLSX.write(workbook, { bookType: 'csv', type: 'array' });
      
      // Tạo Blob từ dữ liệu binary
      const blob = new Blob([excelData], {
        type: outputFormat === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv'
      });
      
      // Tạo File từ Blob
      return new File([blob], `converted.${outputFormat}`, {
        type: outputFormat === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
      });
    } catch (error) {
      console.error('Lỗi khi chuyển đổi file:', error);
      throw error;
    }
  }
  
  /**
   * Phương thức để trích xuất dữ liệu bảng từ nội dung văn bản PDF
   */
  private extractTableData(textContent: any, viewport: any): string[][] {
    const items = textContent.items;
    if (!items.length) return [['No data found']];
    
    // Sắp xếp theo y-position trước, sau đó theo x-position
    items.sort((a: any, b: any) => {
      if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
        return b.transform[5] - a.transform[5]; // Theo y-position (ngược lại vì PDF bắt đầu từ dưới lên)
      }
      return a.transform[4] - b.transform[4]; // Theo x-position
    });
    
    // Nhóm các mục theo hàng dựa trên y-position
    const rows: any[] = [];
    let currentRow: any[] = [];
    let currentY = items[0].transform[5];
    
    items.forEach((item: any) => {
      const y = item.transform[5];
      // Nếu khác hàng (y-position khác nhau đáng kể)
      if (Math.abs(y - currentY) > 5) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        currentY = y;
      }
      currentRow.push(item.str);
    });
    
    // Thêm hàng cuối cùng
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    
    return rows;
  }
}
