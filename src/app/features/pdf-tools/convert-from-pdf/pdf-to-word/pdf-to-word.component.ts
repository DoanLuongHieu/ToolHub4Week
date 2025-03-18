import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PdfConversionService } from '../services/pdf-conversion.service';

@Component({
  selector: 'app-pdf-to-word',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pdf-to-word.component.html',
  styleUrls: ['./pdf-to-word.component.css'],
})
export class PdfToWordComponent implements OnInit {
  selectedFile: File | null = null;
  isDragging = false;
  isConverting = false;
  conversionProgress = 0;
  apiAvailable = false;
  apiError = '';

  constructor(private pdfConversionService: PdfConversionService) {}

  ngOnInit(): void {
    this.checkApiStatus();
  }

  checkApiStatus(): void {
    this.pdfConversionService.checkApiStatus().subscribe({
      next: (isAvailable) => {
        this.apiAvailable = isAvailable;
        this.apiError = '';
      },
      error: (error) => {
        this.apiAvailable = false;
        this.apiError = 'Máy chủ chuyển đổi PDF hiện không khả dụng. Vui lòng thử lại sau.';
        console.error('API Status Check Failed:', error);
      }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File): void {
    if (file.type !== 'application/pdf') {
      alert('Vui lòng chọn file PDF');
      return;
    }
    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async convertToWord(): Promise<void> {
    if (!this.selectedFile || !this.apiAvailable) return;

    this.isConverting = true;
    this.conversionProgress = 0;

    try {
      this.pdfConversionService.convertPdfToWord(this.selectedFile).subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0) {
            this.conversionProgress = 100;
            // Tạo URL để tải xuống file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.selectedFile!.name.replace('.pdf', '.docx');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
        },
        error: (error) => {
          console.error('Conversion failed:', error);
          alert('Chuyển đổi thất bại. Vui lòng thử lại.');
        },
        complete: () => {
          this.isConverting = false;
        }
      });
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
      this.isConverting = false;
    }
  }
}
