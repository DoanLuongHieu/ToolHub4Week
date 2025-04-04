import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageConversionService } from '../../services/image-conversion.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';

interface ConversionState {
  isConverting: boolean;
  error: string | null;
  originalImage: string | null;
  convertedImage: string | null;
  originalFormat: string | null;
  targetFormat: string | null;
}

type ImageFormat = 'jpg' | 'png' | 'webp';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './image-converter.component.html',
  styleUrl: './image-converter.component.css',
})
export class ImageConverterComponent {
  private imageService = inject(ImageConversionService);
  private themeService = inject(ThemeService);

  state = signal<ConversionState>({
    isConverting: false,
    error: null,
    originalImage: null,
    convertedImage: null,
    originalFormat: null,
    targetFormat: null,
  });

  isDragging = false;
  supportedFormats: ImageFormat[] = ['jpg', 'png', 'webp'];

  getAvailableFormats(): ImageFormat[] {
    return this.supportedFormats.filter(
      (format) => format !== this.state().originalFormat
    );
  }

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
      // Display original image
      const originalUrl = URL.createObjectURL(file);

      this.state.set({
        ...this.state(),
        originalImage: originalUrl,
        originalFormat: format,
        convertedImage: null,
        targetFormat: null,
        error: null,
      });
    } catch (error) {
      this.state.set({
        ...this.state(),
        error: 'Error loading image',
      });
    }
  }

  async convertImage(targetFormat: ImageFormat): Promise<void> {
    const originalImage = this.state().originalImage;
    if (!originalImage) return;

    try {
      this.state.set({
        ...this.state(),
        isConverting: true,
        error: null,
      });

      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], `image.${this.state().originalFormat}`, {
        type: `image/${this.state().originalFormat}`,
      });

      let convertedFile: File;
      switch (targetFormat) {
        case 'png':
          convertedFile = await this.imageService.convertToPng(file);
          break;
        case 'webp':
          convertedFile = await this.imageService.convertToWebp(file);
          break;
        case 'jpg':
          convertedFile = await this.imageService.convertToJpg(file);
          break;
        default:
          throw new Error('Unsupported format');
      }

      const convertedUrl = URL.createObjectURL(convertedFile);

      this.state.set({
        ...this.state(),
        isConverting: false,
        convertedImage: convertedUrl,
        targetFormat,
      });
    } catch (error) {
      this.state.set({
        ...this.state(),
        isConverting: false,
        error: 'Error converting image',
      });
    }
  }

  private getFileFormat(file: File): ImageFormat | null {
    const type = file.type.toLowerCase();
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    return null;
  }

  downloadImage(): void {
    const convertedImage = this.state().convertedImage;
    const targetFormat = this.state().targetFormat;
    if (!convertedImage || !targetFormat) return;

    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `converted-image.${targetFormat}`;
    link.click();
  }

  ngOnDestroy(): void {
    // Cleanup URLs
    const originalImage = this.state().originalImage;
    const convertedImage = this.state().convertedImage;

    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    if (convertedImage) {
      URL.revokeObjectURL(convertedImage);
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
}
