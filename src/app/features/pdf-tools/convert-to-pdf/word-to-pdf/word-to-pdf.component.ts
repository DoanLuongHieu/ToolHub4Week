import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

interface ConversionState {
  isConverting: boolean;
  error: string | null;
  progress: number;
  originalFile: File | null;
  convertedUrl: string | null;
}

@Component({
  selector: 'app-word-to-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  templateUrl: './word-to-pdf.component.html',
  styleUrl: './word-to-pdf.component.css',
})
export class WordToPdfComponent {
  private http = inject(HttpClient);

  state = signal<ConversionState>({
    isConverting: false,
    error: null,
    progress: 0,
    originalFile: null,
    convertedUrl: null,
  });

  isDragging = false;
  supportedFormats = ['.doc', '.docx'];

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

    if (!this.isValidFormat(file)) {
      this.state.update((state) => ({
        ...state,
        error:
          'Invalid file format. Please select a Word document (.doc or .docx)',
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
    const file = this.state().originalFile;
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.state.update((state) => ({
      ...state,
      isConverting: true,
      error: null,
      progress: 0,
    }));

    try {
      this.http
        .post(`/api/convert/word-to-pdf`, formData, {
          reportProgress: true,
          observe: 'events',
          responseType: 'blob',
        })
        .pipe(
          finalize(() => {
            this.state.update((state) => ({
              ...state,
              isConverting: false,
            }));
          })
        )
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const progress = event.total
                ? Math.round((100 * event.loaded) / event.total)
                : 0;

              this.state.update((state) => ({
                ...state,
                progress,
              }));
            }

            if (event.type === HttpEventType.Response) {
              const blob = event.body as Blob;
              const url = URL.createObjectURL(blob);

              this.state.update((state) => ({
                ...state,
                convertedUrl: url,
              }));
            }
          },
          error: (error) => {
            this.state.update((state) => ({
              ...state,
              error: 'Error converting file. Please try again.',
            }));
          },
        });
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        error: 'Error converting file. Please try again.',
      }));
    }
  }

  downloadPdf(): void {
    const url = this.state().convertedUrl;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = this.getOutputFilename();
    link.click();
  }

  private getOutputFilename(): string {
    const originalName = this.state().originalFile?.name || 'document';
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
    const convertedUrl = this.state().convertedUrl;
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl);
    }
  }
}
