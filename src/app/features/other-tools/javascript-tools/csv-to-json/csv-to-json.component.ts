import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/theme.service';
import { Signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface JsonOutputOptions {
  detectDataTypes: boolean;
  processNestedObjects: boolean;
  processNestedArrays: boolean;
  outputFormat: 'pretty' | 'compact';
}

@Component({
  selector: 'app-csv-to-json',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './csv-to-json.component.html',
  styleUrl: './csv-to-json.component.css',
})
export class CsvToJsonComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private themeService = inject(ThemeService);
  private translateService = inject(TranslateService);
  
  isDarkTheme: Signal<boolean> = this.themeService.getCurrentTheme();

  // File & Upload variables
  csvData: string | null = null;
  csvInput: string = '';
  fileName: string = '';
  fileSize: string = '';
  isDragging: boolean = false;
  showTextArea: boolean = false;

  // Conversion options
  delimiter: string = ',';
  customDelimiter: string = '';
  hasHeader: boolean = true;
  detectDataTypes: boolean = true;
  processNestedObjects: boolean = true;
  processNestedArrays: boolean = true;
  outputFormat: 'pretty' | 'compact' = 'pretty';

  // Output variables
  parsedData: any[] = [];
  headers: string[] = [];
  jsonOutput: string = '';

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
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      this.errorMessage = 'Vui lòng tải lên file CSV hợp lệ';
      return;
    }

    this.processFile(file);
  }

  processFile(file: File): void {
    if (file.size > 50 * 1024 * 1024) {
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
        this.csvData = content;
        this.csvInput = content;
        this.parseCSV();
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
            this.csvData = content;
            this.csvInput = content;
            this.parseCSV();
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

  // CSV parsing methods
  parseCSV(): void {
    try {
      if (!this.csvData && !this.csvInput) {
        this.parsedData = [];
        this.jsonOutput = '';
        return;
      }

      const csvText = this.csvData || this.csvInput;
      if (!csvText.trim()) {
        this.errorMessage = 'Dữ liệu CSV trống';
        return;
      }

      this.errorMessage = '';
      const effectiveDelimiter =
        this.delimiter === 'custom'
          ? this.customDelimiter
          : this.delimiter === '\\t'
          ? '\t'
          : this.delimiter;

      // Xử lý từng dòng để tránh tràn bộ nhớ
      const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim());

      if (lines.length === 0) {
        this.errorMessage = 'Không tìm thấy dữ liệu trong CSV';
        return;
      }

      // Parse headers
      if (this.hasHeader) {
        const headerLine = lines[0];
        this.headers = this.parseCSVLine(headerLine, effectiveDelimiter);
        lines.shift();
      } else {
        const firstLine = this.parseCSVLine(lines[0], effectiveDelimiter);
        this.headers = Array.from(
          { length: firstLine.length },
          (_, i) => `column${i + 1}`
        );
      }

      // Xử lý dữ liệu theo chunks để tránh treo trình duyệt
      const chunkSize = 1000; // Số dòng xử lý mỗi lần
      let currentIndex = 0;

      const processChunk = () => {
        const chunk = lines.slice(currentIndex, currentIndex + chunkSize);
        const chunkData = chunk.map((line) => {
          const values = this.parseCSVLine(line, effectiveDelimiter);
          const obj: Record<string, any> = {};

          for (let i = 0; i < this.headers.length; i++) {
            if (i < values.length) {
              obj[this.headers[i]] = values[i];
            } else {
              obj[this.headers[i]] = '';
            }
          }

          return obj;
        });

        this.parsedData.push(...chunkData);
        currentIndex += chunkSize;

        if (currentIndex < lines.length) {
          setTimeout(processChunk, 0);
        } else {
          this.generateJSON();
        }
      };

      this.parsedData = [];
      processChunk();
    } catch (error) {
      this.errorMessage =
        'Lỗi khi phân tích CSV: ' +
        (error instanceof Error ? error.message : String(error));
      console.error('CSV parsing error:', error);
    }
  }

  parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i < line.length - 1 ? line[i + 1] : '';

      if (char === '"' && current === '' && !inQuotes) {
        // Start of quoted field
        inQuotes = true;
      } else if (char === '"' && nextChar === '"' && inQuotes) {
        // Escaped quote within a quoted field
        current += '"';
        i++; // Skip the next quote
      } else if (char === '"' && inQuotes) {
        // End of quoted field
        inQuotes = false;
      } else if (char === delimiter && !inQuotes) {
        // End of field
        result.push(current);
        current = '';
      } else {
        // Regular character
        current += char;
      }
    }

    // Add the last field
    result.push(current);
    return result;
  }

  // JSON generation methods
  generateJSON(): void {
    try {
      if (this.parsedData.length === 0) {
        this.jsonOutput = '';
        return;
      }

      const options: JsonOutputOptions = {
        detectDataTypes: this.detectDataTypes,
        processNestedObjects: this.processNestedObjects,
        processNestedArrays: this.processNestedArrays,
        outputFormat: this.outputFormat,
      };

      const processedData = this.processData(this.parsedData, options);

      // Generate JSON string with appropriate formatting
      this.jsonOutput =
        options.outputFormat === 'pretty'
          ? JSON.stringify(processedData, null, 2)
          : JSON.stringify(processedData);
    } catch (error) {
      this.errorMessage =
        'Lỗi khi tạo JSON: ' +
        (error instanceof Error ? error.message : String(error));
      console.error('JSON generation error:', error);
    }
  }

  processData(data: any[], options: JsonOutputOptions): any[] {
    return data.map((item) => {
      const processedItem: Record<string, any> = {};

      for (const [key, value] of Object.entries(item)) {
        // Process nested structures
        if (options.processNestedObjects && key.includes('.')) {
          this.processNestedObject(processedItem, key, value);
          continue;
        }

        if (
          options.processNestedArrays &&
          key.includes('[') &&
          key.includes(']')
        ) {
          this.processNestedArray(processedItem, key, value);
          continue;
        }

        // Type conversion
        processedItem[key] = options.detectDataTypes
          ? this.convertDataType(value as string)
          : value;
      }

      return processedItem;
    });
  }

  processNestedObject(
    item: Record<string, any>,
    key: string,
    value: any
  ): void {
    const parts = key.split('.');
    let current = item;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      } else if (typeof current[part] !== 'object') {
        // Handle the case where the path conflicts with an existing non-object value
        current[part] = {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = this.detectDataTypes
      ? this.convertDataType(value as string)
      : value;
  }

  processNestedArray(item: Record<string, any>, key: string, value: any): void {
    const match = key.match(/^([^\[]+)(?:\[(\d+)\])+/);
    if (!match) return;

    const baseKey = match[1];
    const index = parseInt(match[2], 10);

    if (!item[baseKey]) {
      item[baseKey] = [];
    } else if (!Array.isArray(item[baseKey])) {
      // If it's not an array yet, make it one
      item[baseKey] = [item[baseKey]];
    }

    // Ensure the array is large enough
    while (item[baseKey].length <= index) {
      item[baseKey].push(null);
    }

    item[baseKey][index] = this.detectDataTypes
      ? this.convertDataType(value as string)
      : value;
  }

  convertDataType(value: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Boolean check
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Null check
    if (value.toLowerCase() === 'null') return null;

    // Number check (includes integers and floats)
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return value.includes('.') ? parseFloat(value) : parseInt(value, 10);
    }

    // Date check (ISO format)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
      return new Date(value).toISOString();
    }

    // Keep as string for other values
    return value;
  }

  // UI interaction methods
  onCsvInputChange(): void {
    this.csvData = this.csvInput || null;
    this.parseCSV();
  }

  toggleRawInput(): void {
    this.showTextArea = !this.showTextArea;
  }

  copyToClipboard(): void {
    if (!this.jsonOutput) return;

    navigator.clipboard
      .writeText(this.jsonOutput)
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

  downloadJSON(): void {
    if (!this.jsonOutput) return;

    const blob = new Blob([this.jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = this.fileName
      ? this.fileName.replace('.csv', '.json')
      : 'data.json';

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
    this.csvData = null;
    this.csvInput = '';
    this.fileName = '';
    this.fileSize = '';
    this.parsedData = [];
    this.headers = [];
    this.jsonOutput = '';
    this.errorMessage = '';
    this.showTextArea = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
