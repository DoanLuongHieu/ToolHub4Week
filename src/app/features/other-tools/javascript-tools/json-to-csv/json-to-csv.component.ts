import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/theme.service';
import { Signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface CsvOutputOptions {
  delimiter: string;
  quoteChar: string;
  flattenObjects: boolean;
  expandArrays: boolean;
  includeNulls: boolean;
  formatDates: boolean;
}

@Component({
  selector: 'app-json-to-csv',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './json-to-csv.component.html',
  styleUrl: './json-to-csv.component.css',
})
export class JsonToCsvComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private themeService = inject(ThemeService);
  private translateService = inject(TranslateService);
  
  isDarkTheme: Signal<boolean> = this.themeService.getCurrentTheme();

  // File & Upload variables
  jsonData: any = null;
  jsonInput: string = '';
  fileName: string = '';
  fileSize: string = '';
  isDragging: boolean = false;
  showTextArea: boolean = false;

  // Conversion options
  delimiter: string = ',';
  customDelimiter: string = '';
  quoteChar: string = '"';
  flattenObjects: boolean = true;
  expandArrays: boolean = false;
  includeNulls: boolean = false;
  formatDates: boolean = true;

  // Output variables
  headers: string[] = [];
  selectedHeaders: string[] = [];
  csvOutput: string = '';
  rowCount: number = 0;

  // UI state
  errorMessage: string = '';
  isCopying: boolean = false;

  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private processingChunks: boolean = false;

  ngOnInit(): void {
    // Initialize with sample data if needed
  }

  // File handling methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      this.errorMessage = 'Vui lòng tải lên file JSON hợp lệ';
      return;
    }

    this.processFile(file);
  }

  processFile(file: File): void {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      this.errorMessage = 'File quá lớn. Kích thước tối đa là 50MB';
      return;
    }

    this.fileName = file.name;
    this.fileSize = this.formatFileSize(file.size);
    this.errorMessage = '';
    this.processingChunks = true;

    try {
      if (file.size > 5 * 1024 * 1024) {
        // If file is larger than 5MB
        this.processLargeFile(file);
      } else {
        this.processSmallFile(file);
      }
    } catch (error) {
      this.errorMessage = `Lỗi khi xử lý file: ${
        error instanceof Error ? error.message : 'Không xác định'
      }`;
      console.error('File processing error:', error);
    }
  }

  private processSmallFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        this.jsonInput = content;
        this.parseJSON(content);
      } catch (error) {
        this.errorMessage = `Lỗi khi đọc nội dung file: ${
          error instanceof Error ? error.message : 'Không xác định'
        }`;
        console.error('Small file processing error:', error);
      }
    };
    reader.onerror = (error) => {
      this.errorMessage = `Lỗi khi đọc file: ${
        error.target?.error?.message || 'Không xác định'
      }`;
      console.error('FileReader error:', error);
    };
    reader.readAsText(file);
  }

  private processLargeFile(file: File): void {
    let offset = 0;
    let content = '';

    const readNextChunk = () => {
      const chunk = file.slice(offset, offset + this.CHUNK_SIZE);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          content += e.target?.result as string;
          offset += this.CHUNK_SIZE;

          if (offset < file.size) {
            // Đọc chunk tiếp theo
            setTimeout(readNextChunk, 0); // Cho phép UI cập nhật
          } else {
            // Hoàn thành đọc file
            this.processingChunks = false;
            this.jsonInput = content;
            this.parseJSON(content);
          }
        } catch (error) {
          this.processingChunks = false;
          this.errorMessage = `Lỗi khi xử lý phần của file: ${
            error instanceof Error ? error.message : 'Không xác định'
          }`;
          console.error('Chunk processing error:', error);
        }
      };

      reader.onerror = (error) => {
        this.processingChunks = false;
        this.errorMessage = `Lỗi khi đọc phần của file: ${
          error.target?.error?.message || 'Không xác định'
        }`;
        console.error('Chunk reading error:', error);
      };

      reader.readAsText(chunk);
    };

    readNextChunk();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // JSON parsing methods
  parseJSON(input: string): void {
    try {
      this.jsonData = JSON.parse(input);

      // Ensure data is an array of objects
      if (!Array.isArray(this.jsonData)) {
        if (typeof this.jsonData === 'object' && this.jsonData !== null) {
          this.jsonData = [this.jsonData];
        } else {
          throw new Error(
            'Dữ liệu JSON phải là một mảng các đối tượng hoặc một đối tượng'
          );
        }
      }

      // Collect all possible headers
      this.headers = this.collectHeaders(this.jsonData);
      this.selectedHeaders = [...this.headers];

      this.generateCSV();
    } catch (error) {
      this.errorMessage = `Lỗi khi phân tích JSON: ${
        error instanceof Error ? error.message : 'Không xác định'
      }`;
      console.error('JSON parsing error:', error);
    }
  }

  collectHeaders(data: any[]): string[] {
    const headers = new Set<string>();

    const processValue = (value: any, prefix: string = ''): void => {
      if (value === null || value === undefined) return;

      if (Array.isArray(value) && this.expandArrays) {
        // Handle arrays if expandArrays is true
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            processValue(item, `${prefix}[${index}].`);
          } else {
            headers.add(`${prefix}[${index}]`);
          }
        });
      } else if (typeof value === 'object') {
        // Process nested objects
        Object.entries(value).forEach(([key, val]) => {
          const newPrefix = prefix ? `${prefix}.${key}` : key;
          if (typeof val === 'object' && val !== null && this.flattenObjects) {
            processValue(val, newPrefix);
          } else {
            headers.add(newPrefix);
          }
        });
      } else {
        headers.add(prefix);
      }
    };

    data.forEach((item) => processValue(item));
    return Array.from(headers).sort();
  }

  // CSV generation methods
  generateCSV(): void {
    try {
      if (!this.jsonData || this.jsonData.length === 0) {
        this.csvOutput = '';
        this.rowCount = 0;
        return;
      }

      const options: CsvOutputOptions = {
        delimiter:
          this.delimiter === 'custom'
            ? this.customDelimiter
            : this.delimiter === '\\t'
            ? '\t'
            : this.delimiter,
        quoteChar: this.quoteChar === 'none' ? '' : this.quoteChar,
        flattenObjects: this.flattenObjects,
        expandArrays: this.expandArrays,
        includeNulls: this.includeNulls,
        formatDates: this.formatDates,
      };

      // Generate CSV header
      const headerRow = this.selectedHeaders
        .map((header) => this.escapeValue(header, options))
        .join(options.delimiter);

      // Generate data rows
      const rows = this.jsonData.map((item: any) => {
        return this.selectedHeaders
          .map((header) => {
            const value = this.getNestedValue(item, header);
            return this.escapeValue(this.formatValue(value, options), options);
          })
          .join(options.delimiter);
      });

      // Combine all rows
      this.csvOutput = [headerRow, ...rows].join('\n');
      this.rowCount = this.jsonData.length;
    } catch (error) {
      this.errorMessage = `Lỗi khi tạo CSV: ${
        error instanceof Error ? error.message : 'Không xác định'
      }`;
      console.error('CSV generation error:', error);
    }
  }

  getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return null;

      // Handle array access
      const arrayMatch = part.match(/^(.*?)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = key ? current[key] : current;
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        } else {
          return null;
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }

  formatValue(value: any, options: CsvOutputOptions): string {
    if (value === null || value === undefined) {
      return options.includeNulls ? 'NULL' : '';
    }

    if (Array.isArray(value)) {
      if (options.expandArrays) {
        return value.map((v) => this.formatValue(v, options)).join(',');
      } else {
        return JSON.stringify(value);
      }
    }

    if (typeof value === 'object') {
      if (value instanceof Date) {
        return options.formatDates ? value.toISOString() : value.toString();
      }
      return options.flattenObjects ? JSON.stringify(value) : '';
    }

    return String(value);
  }

  escapeValue(value: string, options: CsvOutputOptions): string {
    if (!value) return '';

    const needsQuotes =
      value.includes(options.delimiter) ||
      value.includes('\n') ||
      value.includes(options.quoteChar);

    if (!needsQuotes) return value;

    const escaped = value.replace(
      new RegExp(options.quoteChar, 'g'),
      options.quoteChar + options.quoteChar
    );
    return `${options.quoteChar}${escaped}${options.quoteChar}`;
  }

  // UI interaction methods
  onJsonInputChange(): void {
    if (!this.jsonInput.trim()) {
      this.resetTool();
      return;
    }
    this.parseJSON(this.jsonInput);
  }

  toggleRawInput(): void {
    this.showTextArea = !this.showTextArea;
  }

  toggleHeader(header: string): void {
    const index = this.selectedHeaders.indexOf(header);
    if (index === -1) {
      this.selectedHeaders.push(header);
    } else {
      this.selectedHeaders.splice(index, 1);
    }
    this.selectedHeaders.sort(
      (a, b) => this.headers.indexOf(a) - this.headers.indexOf(b)
    );
    this.generateCSV();
  }

  copyToClipboard(): void {
    if (!this.csvOutput) return;

    navigator.clipboard
      .writeText(this.csvOutput)
      .then(() => {
        this.isCopying = true;
        setTimeout(() => {
          this.isCopying = false;
        }, 2000);
      })
      .catch(() => {
        this.errorMessage =
          'Không thể sao chép vào clipboard. Vui lòng thử lại.';
      });
  }

  downloadCSV(): void {
    if (!this.csvOutput) return;

    const blob = new Blob([this.csvOutput], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = this.fileName
      ? this.fileName.replace('.json', '.csv')
      : 'data.csv';

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  resetTool(): void {
    this.jsonData = null;
    this.jsonInput = '';
    this.fileName = '';
    this.fileSize = '';
    this.headers = [];
    this.selectedHeaders = [];
    this.csvOutput = '';
    this.rowCount = 0;
    this.errorMessage = '';
    this.showTextArea = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
