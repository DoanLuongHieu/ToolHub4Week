import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfConversionService } from '../../services/pdf-conversion.service';
import { ThemeService } from '../../../../core/services/theme.service';

interface ConversionState {
  isConverting: boolean;
  error: string | null;
  originalFile: File | null;
  convertedFile: File | null;
  outputFormat: 'xlsx' | 'csv';
  isDragging: boolean;
}

@Component({
  selector: 'app-pdf-to-excel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdf-to-excel.component.html',
  styleUrl: './pdf-to-excel.component.css',
})
export class PdfToExcelComponent {
  private pdfService = inject(PdfConversionService);
  private themeService = inject(ThemeService);

  isDarkTheme = this.themeService.getCurrentTheme();
  isDragging = false;

  state = signal<ConversionState>({
    isConverting: false,
    error: null,
    originalFile: null,
    convertedFile: null,
    outputFormat: 'xlsx',
    isDragging: false,
  });

  supportedFormats = ['xlsx', 'csv'] as const;

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.state.update((state) => ({
        ...state,
        error: 'Please select a file',
      }));
      return;
    }

    if (!file.type.includes('pdf')) {
      this.state.update((state) => ({
        ...state,
        error: 'Please select a valid PDF file',
      }));
      return;
    }

    this.state.update((state) => ({
      ...state,
      originalFile: file,
      error: null,
      convertedFile: null,
    }));
  }

  async convertFile(): Promise<void> {
    const file = this.state().originalFile;
    if (!file) return;

    try {
      this.state.update((state) => ({
        ...state,
        isConverting: true,
        error: null,
      }));

      const convertedFile = await this.pdfService.convertPdfToExcel(
        file,
        this.state().outputFormat
      );

      this.state.update((state) => ({
        ...state,
        isConverting: false,
        convertedFile,
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        isConverting: false,
        error: 'Error converting file. Please try again.',
      }));
    }
  }

  updateFormat(format: 'xlsx' | 'csv'): void {
    this.state.update((state) => ({
      ...state,
      outputFormat: format,
      convertedFile: null,
    }));
  }

  downloadFile(): void {
    const file = this.state().convertedFile;
    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-file.${this.state().outputFormat}`;
    link.click();

    URL.revokeObjectURL(url);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.state.update((state) => ({ ...state, isDragging: true }));
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.state.update((state) => ({ ...state, isDragging: false }));
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.state.update((state) => ({ ...state, isDragging: false }));

    const files = event.dataTransfer?.files;
    if (files?.length) {
      const fakeEvent = {
        target: {
          files: files,
        },
      } as unknown as Event;
      await this.handleFileInput(fakeEvent);
    }
  }

  ngOnDestroy(): void {
    const convertedFile = this.state().convertedFile;
    if (convertedFile) {
      URL.revokeObjectURL(URL.createObjectURL(convertedFile));
    }
  }
}
