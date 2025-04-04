import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-excel-to-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './excel-to-pdf.component.html',
  styleUrl: './excel-to-pdf.component.css'
})
export class ExcelToPdfComponent implements OnInit {
  isConverting: boolean = false;
  maxFileSize: number = 50 * 1024 * 1024; // 50MB
  supportedFormats: string[] = ['.xlsx', '.csv', '.xls', '.xlsm', '.txt'];
  errorMessage: string = '';
  file: File | null = null;
  progress: number = 0;
  showProgress: boolean = false;
  
  constructor() {}

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      const fileExt = this.getFileExtension(this.file.name).toLowerCase();
      
      // Kiểm tra định dạng file
      if (!this.supportedFormats.includes(fileExt)) {
        this.errorMessage = 'Định dạng file không được hỗ trợ. Vui lòng chọn file Excel (.xlsx, .csv, .xls, .xlsm, .txt)';
        this.file = null;
        return;
      }
      
      // Kiểm tra kích thước file
      if (this.file.size > this.maxFileSize) {
        this.errorMessage = 'Kích thước file vượt quá giới hạn 50MB';
        this.file = null;
        return;
      }
      
      this.errorMessage = '';
    }
  }

  getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop() || '';
  }

  convertToPdf(): void {
    if (!this.file) {
      this.errorMessage = 'Vui lòng chọn file trước khi chuyển đổi';
      return;
    }

    this.isConverting = true;
    this.showProgress = true;
    this.progress = 10;

    const reader = new FileReader();
    const fileExt = this.getFileExtension(this.file.name).toLowerCase();
    
    reader.onload = async (e: any) => {
      try {
        this.progress = 20;
        const data = new Uint8Array(e.target.result);
        
        // Đọc file bằng SheetJS để hỗ trợ nhiều định dạng
        const workbookSheetJS = XLSX.read(data, { type: 'array' });
        
        this.progress = 30;
        
        // Nếu là định dạng xlsx hoặc xlsm, sử dụng ExcelJS để giữ nguyên định dạng
        if (fileExt === '.xlsx' || fileExt === '.xlsm') {
          try {
            // Sử dụng ExcelJS để xử lý định dạng phức tạp (màu sắc, biểu đồ, định dạng ô)
            await this.processWithExcelJS(data);
          } catch (excelJSError) {
            console.warn('Không thể xử lý với ExcelJS, chuyển sang SheetJS:', excelJSError);
            // Fallback về SheetJS nếu ExcelJS gặp lỗi
            this.processWithSheetJS(workbookSheetJS);
          }
        } else {
          // Với các định dạng khác, sử dụng SheetJS
          this.processWithSheetJS(workbookSheetJS);
        }
      } catch (error) {
        console.error('Lỗi khi xử lý file:', error);
        this.errorMessage = 'Có lỗi xảy ra khi xử lý file. Vui lòng thử lại với file khác.';
        this.isConverting = false;
        this.showProgress = false;
      }
    };
    
    reader.onerror = () => {
      this.errorMessage = 'Không thể đọc file. Vui lòng thử lại.';
      this.isConverting = false;
      this.showProgress = false;
    };
    
    reader.readAsArrayBuffer(this.file);
  }

  // Hàm chuyển ký tự Unicode tiếng Việt sang không dấu
  convertToNonAccentVietnamese(str: string): string {
    if (!str) return '';
    
    str = str.toLowerCase();
    
    // Mảng các ký tự gốc và ký tự thay thế
    const pairs = [
      // a với dấu
      { from: /[áàảãạâấầẩẫậăắằẳẵặ]/g, to: 'a' },
      // đ
      { from: /đ/g, to: 'd' },
      // e với dấu
      { from: /[éèẻẽẹêếềểễệ]/g, to: 'e' },
      // i với dấu
      { from: /[íìỉĩị]/g, to: 'i' },
      // o với dấu
      { from: /[óòỏõọôốồổỗộơớờởỡợ]/g, to: 'o' },
      // u với dấu
      { from: /[úùủũụưứừửữự]/g, to: 'u' },
      // y với dấu
      { from: /[ýỳỷỹỵ]/g, to: 'y' }
    ];
    
    // Thực hiện thay thế từng nhóm ký tự
    pairs.forEach(pair => {
      str = str.replace(pair.from, pair.to);
    });
    
    return str;
  }

  async processWithExcelJS(data: Uint8Array): Promise<void> {
    this.progress = 40;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data.buffer);
    
    this.progress = 50;
    const doc = new jsPDF();
    
    // Thiết lập font Unicode tiếng Việt
    doc.setFont('Vietnamese');
    
    let isFirstPage = true;
    
    // Xử lý từng sheet
    for (const worksheet of workbook.worksheets) {
      if (!isFirstPage) {
        doc.addPage();
      }
      
      // Thêm tên sheet vào PDF - Chuyển tên sheet sang không dấu
      const sheetName = this.convertToNonAccentVietnamese(worksheet.name);
      doc.setFontSize(18);
      doc.setFont('Vietnamese');
      doc.text(`Sheet: ${sheetName}`, 14, 20);
      doc.setFontSize(10);
      
      this.progress = 60;
      
      // Chuẩn bị dữ liệu cho autoTable
      const tableData: any[][] = [];
      const tableHeaders: any[] = [];
      
      // Lấy header từ hàng đầu tiên (nếu có)
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Xử lý định dạng header và chuyển sang không dấu
        let headerValue = cell.value?.toString() || '';
        headerValue = this.convertToNonAccentVietnamese(headerValue);
        tableHeaders.push(headerValue);
      });
      
      // Lấy dữ liệu từ các hàng còn lại
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData: any[] = [];
        
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Xử lý các loại dữ liệu khác nhau
          let cellValue: any;
          
          if (cell.formula) {
            // Nếu có công thức, lấy giá trị đã tính toán
            cellValue = cell.result?.toString() || '';
          } else if (cell.value) {
            // Xử lý các loại giá trị
            if (typeof cell.value === 'object') {
              if ('hyperlink' in cell.value && cell.value.hyperlink) {
                cellValue = ('text' in cell.value && cell.value.text) ? cell.value.text : cell.value.hyperlink;
              } else if ('richText' in cell.value && cell.value.richText) {
                // Xử lý văn bản có định dạng richText
                cellValue = cell.value.richText.map((rt: any) => rt.text).join('');
              } else {
                cellValue = cell.value.toString();
              }
            } else {
              cellValue = cell.value.toString();
            }
          } else {
            cellValue = '';
          }
          
          // Chuyển đổi sang không dấu
          cellValue = this.convertToNonAccentVietnamese(cellValue);
          rowData.push(cellValue);
        });
        
        if (rowData.some(cell => cell !== '')) {
          tableData.push(rowData);
        }
      }
      
      this.progress = 70;
      
      // Tạo bảng trong PDF với định dạng
      if (tableHeaders.length > 0 || tableData.length > 0) {
        autoTable(doc, {
          startY: 30,
          head: tableHeaders.length > 0 ? [tableHeaders] : undefined,
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            font: 'Vietnamese' // Sử dụng font tiếng Việt
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
          },
          // Bổ sung thêm các style khác nếu cần
          didDrawCell: (data: any) => {
            // Có thể thêm hàm callback để xử lý các định dạng đặc biệt
          }
        });
      } else {
        doc.setFont('Vietnamese');
        doc.text('Không có dữ liệu trong sheet này', 14, 40);
      }
      
      isFirstPage = false;
    }
    
    this.progress = 90;
    
    // Lưu PDF
    const fileName = this.file?.name.split('.')[0] || 'excel_converted';
    doc.save(`${fileName}.pdf`);
    
    this.progress = 100;
    setTimeout(() => {
      this.isConverting = false;
      this.showProgress = false;
      this.progress = 0;
    }, 1000);
  }

  processWithSheetJS(workbook: XLSX.WorkBook): void {
    try {
      const doc = new jsPDF();
      doc.setFont('Vietnamese');
      
      let firstPage = true;
      
      // Lặp qua tất cả các sheets
      for (const sheetName of workbook.SheetNames) {
        if (!firstPage) {
          doc.addPage();
        }
        
        // Convert sheet to JSON
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Thêm tên sheet vào PDF - Chuyển sang không dấu
        const normalizedSheetName = this.convertToNonAccentVietnamese(sheetName);
        doc.setFontSize(18);
        doc.setFont('Vietnamese');
        doc.text(`Sheet: ${normalizedSheetName}`, 14, 20);
        doc.setFontSize(10);
        
        // Xử lý các thuộc tính định dạng (nếu có)
        const sheetStyles: any = {};
        if (worksheet['!cols']) {
          // Xử lý độ rộng cột
          sheetStyles.columnStyles = {};
          worksheet['!cols'].forEach((col: any, index: number) => {
            if (col.width) {
              sheetStyles.columnStyles[index] = { cellWidth: col.width / 7 }; // Điều chỉnh tỷ lệ
            }
          });
        }
        
        // Chuyển đổi dữ liệu sang không dấu
        const normalizedData = jsonData.map((row: any) => {
          if (Array.isArray(row)) {
            return row.map((cell: any) => 
              typeof cell === 'string' ? this.convertToNonAccentVietnamese(cell) : cell
            );
          }
          return row;
        });
        
        // Chuyển đổi dữ liệu sheet thành bảng trong PDF
        if (normalizedData.length > 0) {
          autoTable(doc, {
            startY: 30,
            head: normalizedData.length > 0 ? [normalizedData[0]] : undefined,
            body: normalizedData.length > 1 ? normalizedData.slice(1) : [],
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
              overflow: 'linebreak',
              font: 'Vietnamese' // Sử dụng font tiếng Việt
            },
            headStyles: {
              fillColor: [66, 139, 202],
              textColor: 255,
              fontStyle: 'bold'
            },
            // Áp dụng các style từ Excel nếu có
            ...sheetStyles
          });
        } else {
          doc.setFont('Vietnamese');
          doc.text('Không có dữ liệu trong sheet này', 14, 40);
        }
        
        firstPage = false;
      }
      
      this.progress = 90;
      
      // Lưu PDF
      const fileName = this.file?.name.split('.')[0] || 'excel_converted';
      doc.save(`${fileName}.pdf`);
      
      this.progress = 100;
      setTimeout(() => {
        this.isConverting = false;
        this.showProgress = false;
        this.progress = 0;
      }, 1000);
      
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      this.errorMessage = 'Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.';
      this.isConverting = false;
      this.showProgress = false;
    }
  }

  resetForm(): void {
    this.file = null;
    this.errorMessage = '';
    this.progress = 0;
    this.showProgress = false;
  }
}
