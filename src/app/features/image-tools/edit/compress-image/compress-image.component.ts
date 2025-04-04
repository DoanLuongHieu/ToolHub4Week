// compress-image.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCompressionService } from '../../services/image-compression.service';
import { TranslateModule } from '@ngx-translate/core';

interface CompressionState {
  isCompressing: boolean;
  error: string | null;
  originalImage: string | null;
  compressedImage: string | null;
  originalFormat: string | null;
  originalSize: number | null;
  compressedSize: number | null;
  quality: number;
  selectedFormat: 'jpeg' | 'png' | 'webp';
}

@Component({
  selector: 'app-compress-image',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './compress-image.component.html',
  styleUrl: './compress-image.component.css',
})
export class CompressImageComponent {
  private compressionService = inject(ImageCompressionService);

  state = signal<CompressionState>({
    isCompressing: false,
    error: null,
    originalImage: null,
    compressedImage: null,
    originalFormat: null,
    originalSize: null,
    compressedSize: null,
    quality: 80,
    selectedFormat: 'jpeg',
  });

  isDragging = false;
  supportedFormats = ['jpeg', 'png', 'webp'] as const;

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.state.set({
        ...this.state(),
        error: 'Please select a file',
      });
      return;
    }

    const format = this.getFileFormat(file);
    if (!format) {
      this.state.set({
        ...this.state(),
        error: 'Unsupported file format. Please select JPG, PNG, or WebP image',
      });
      return;
    }

    try {
      const originalUrl = URL.createObjectURL(file);
      const originalSize = this.compressionService.getFileSizeInKB(file);

      this.state.set({
        ...this.state(),
        originalImage: originalUrl,
        originalFormat: format,
        originalSize,
        compressedImage: null,
        compressedSize: null,
        error: null,
      });
    } catch (error) {
      this.state.set({
        ...this.state(),
        error: 'Error loading image',
      });
    }
  }

  async compressImage(): Promise<void> {
    const originalImage = this.state().originalImage;
    if (!originalImage) return;

    try {
      this.state.set({
        ...this.state(),
        isCompressing: true,
        error: null,
      });

      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], `image.${this.state().originalFormat}`, {
        type: `image/${this.state().originalFormat}`,
      });

      const compressedFile = await this.compressionService.compressImage(
        file,
        this.state().quality,
        this.state().selectedFormat
      );

      const compressedUrl = URL.createObjectURL(compressedFile);
      const compressedSize =
        this.compressionService.getFileSizeInKB(compressedFile);

      this.state.set({
        ...this.state(),
        isCompressing: false,
        compressedImage: compressedUrl,
        compressedSize,
      });
    } catch (error) {
      this.state.set({
        ...this.state(),
        isCompressing: false,
        error: 'Error compressing image',
      });
    }
  }

  private getFileFormat(file: File): string | null {
    const type = file.type.toLowerCase();
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpeg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    return null;
  }

  updateQuality(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.state.update((state) => ({
      ...state,
      quality: Number(input.value),
    }));
  }

  updateFormat(format: 'jpeg' | 'png' | 'webp'): void {
    this.state.update((state) => ({
      ...state,
      selectedFormat: format,
    }));
  }

  downloadImage(): void {
    const compressedImage = this.state().compressedImage;
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed-image.${
      this.state().selectedFormat === 'jpeg'
        ? 'jpg'
        : this.state().selectedFormat
    }`;
    link.click();
  }

  ngOnDestroy(): void {
    const originalImage = this.state().originalImage;
    const compressedImage = this.state().compressedImage;

    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    if (compressedImage) {
      URL.revokeObjectURL(compressedImage);
    }
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

  getCompressionRatio(): number {
    const originalSize = this.state().originalSize;
    const compressedSize = this.state().compressedSize;
    if (!originalSize || !compressedSize) return 0;
    return Math.round((1 - compressedSize / originalSize) * 100);
  }
}
