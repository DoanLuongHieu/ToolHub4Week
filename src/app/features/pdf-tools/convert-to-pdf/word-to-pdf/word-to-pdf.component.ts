import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordConversionService } from '../services/word-conversion.service';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { WordToPdfState } from './word-to-pdf.state';

interface ConversionState {
  isConverting: boolean;
  error: string | null;
  progress: number;
  originalFile: File | null;
  convertedUrl: string | null;
  apiAvailable: boolean;
}

@Component({
  selector: 'app-word-to-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe, TranslateModule],
  templateUrl: './word-to-pdf.component.html',
  styleUrl: './word-to-pdf.component.css',
})
export class WordToPdfComponent implements OnDestroy {
  private wordConversionService = inject(WordConversionService);
  private translateService = inject(TranslateService);
  state = new WordToPdfState();

  isDragging = false;
  supportedFormats = ['.doc', '.docx'];

  constructor() {
    this.checkApiStatus();
  }

  private checkApiStatus(): void {
    this.wordConversionService.checkApiStatus().subscribe({
      next: (isAvailable) => {
        this.state.update((state) => ({
          ...state,
          apiAvailable: isAvailable,
          error: null,
        }));
      },
      error: (error) => {
        this.state.update((state) => ({
          ...state,
          apiAvailable: false,
          error: this.translateService.instant(
            'PDF_TOOLS.TO_PDF_CONVERTERS.FROM_WORD.API_ERRORS.SERVER_UNAVAILABLE'
          ),
        }));
      },
    });
  }

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.state.update((state) => ({
        ...state,
        error: 'Vui lòng chọn một file',
      }));
      return;
    }

    if (!this.isValidFormat(file)) {
      this.state.update((state) => ({
        ...state,
        error:
          'Định dạng file không hợp lệ. Vui lòng chọn file Word (.doc hoặc .docx)',
      }));
      return;
    }

    this.state.update((state) => ({
      ...state,
      originalFile: file,
      error: null,
      convertedUrl: null,
    }));
  }

  private isValidFormat(file: File): boolean {
    return this.supportedFormats.some((format) =>
      file.name.toLowerCase().endsWith(format)
    );
  }

  async convertToPdf(): Promise<void> {
    const file = this.state.call().originalFile;
    if (!file || !this.state.call().apiAvailable) return;

    this.state.update((state) => ({
      ...state,
      isConverting: true,
      error: null,
      progress: 0,
    }));

    try {
      this.wordConversionService.convertWordToPdf(file).subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            this.state.update((state) => ({
              ...state,
              convertedUrl: url,
              progress: 100,
            }));
          }
        },
        error: (error) => {
          this.state.update((state) => ({
            ...state,
            error: this.translateService.instant(
              'PDF_TOOLS.TO_PDF_CONVERTERS.FROM_WORD.API_ERRORS.CONVERSION_ERROR'
            ),
          }));
        },
        complete: () => {
          this.state.update((state) => ({
            ...state,
            isConverting: false,
          }));
        },
      });
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        error: this.translateService.instant(
          'PDF_TOOLS.TO_PDF_CONVERTERS.FROM_WORD.API_ERRORS.CONVERSION_ERROR'
        ),
        isConverting: false,
      }));
    }
  }

  downloadPdf(): void {
    const url = this.state.call().convertedUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = this.getOutputFilename();
    link.click();
  }

  private getOutputFilename(): string {
    const originalName = this.state.call().originalFile?.name || 'document';
    const baseName = originalName.split('.').slice(0, -1).join('.');
    return `${baseName}.pdf`;
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

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      await this.handleFileInput({ target: { files } } as any);
    }
  }

  ngOnDestroy(): void {
    const convertedUrl = this.state.call().convertedUrl;
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl);
    }
  }
}
