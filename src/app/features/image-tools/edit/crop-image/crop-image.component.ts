import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  inject,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropState {
  error: string | null;
  originalImage: string | null;
  croppedImage: string | null;
  originalFormat: string | null;
  selectedFormat: 'jpg' | 'png' | 'webp';
  selectedRatio: number | null;
  rotation: number;
  cropBox: CropBox;
}

@Component({
  selector: 'app-crop-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crop-image.component.html',
  styleUrl: './crop-image.component.css',
})
export class CropImageComponent implements AfterViewInit {
  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('sourceImage') sourceImage!: ElementRef<HTMLImageElement>;

  private themeService = inject(ThemeService);
  isDarkTheme = this.themeService.getCurrentTheme();

  state = signal<CropState>({
    error: null,
    originalImage: null,
    croppedImage: null,
    originalFormat: null,
    selectedFormat: 'jpg',
    selectedRatio: null,
    rotation: 0,
    cropBox: { x: 0, y: 0, width: 0, height: 0 },
  });

  isDragging = false;
  dragStart = { x: 0, y: 0 };
  currentHandle: string | null = null;
  supportedFormats = ['jpg', 'png', 'webp'] as const;
  cropHandles = ['n', 'e', 's', 'w', 'nw', 'ne', 'sw', 'se'];

  aspectRatios = [
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
  ];

  ngAfterViewInit() {
    if (this.sourceImage?.nativeElement) {
      this.sourceImage.nativeElement.onload = () => {
        this.initCropBox();
      };
    }
  }

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.state.update((s) => ({ ...s, error: 'Please select a file' }));
      return;
    }

    const format = this.getFileFormat(file);
    if (!format) {
      this.state.update((s) => ({
        ...s,
        error: 'Unsupported file format. Please select JPG, PNG, or WebP image',
      }));
      return;
    }

    try {
      const originalUrl = URL.createObjectURL(file);
      this.state.update((s) => ({
        ...s,
        originalImage: originalUrl,
        originalFormat: format,
        croppedImage: null,
        error: null,
      }));
    } catch (error) {
      this.state.update((s) => ({ ...s, error: 'Error loading image' }));
    }
  }

  private getFileFormat(file: File): string | null {
    const type = file.type.toLowerCase();
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    return null;
  }

  private initCropBox(): void {
    const img = this.sourceImage.nativeElement;
    const container = this.imageContainer.nativeElement;
    const containerRect = container.getBoundingClientRect();

    const cropWidth = containerRect.width * 0.8;
    const cropHeight = cropWidth * (this.state().selectedRatio || 1);

    const x = (containerRect.width - cropWidth) / 2;
    const y = (containerRect.height - cropHeight) / 2;

    this.state.update((s) => ({
      ...s,
      cropBox: {
        x,
        y,
        width: cropWidth,
        height: cropHeight,
      },
    }));
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.currentHandle) {
      this.isDragging = true;
      this.dragStart = {
        x: event.clientX - this.state().cropBox.x,
        y: event.clientY - this.state().cropBox.y,
      };
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging && !this.currentHandle) return;

    const container = this.imageContainer.nativeElement;
    const containerRect = container.getBoundingClientRect();

    if (this.currentHandle) {
      this.resizeCropBox(event, containerRect);
    } else {
      this.moveCropBox(event, containerRect);
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
    this.currentHandle = null;
  }

  private moveCropBox(event: MouseEvent, containerRect: DOMRect): void {
    let newX = event.clientX - this.dragStart.x;
    let newY = event.clientY - this.dragStart.y;

    // Constrain to container bounds
    newX = Math.max(
      0,
      Math.min(newX, containerRect.width - this.state().cropBox.width)
    );
    newY = Math.max(
      0,
      Math.min(newY, containerRect.height - this.state().cropBox.height)
    );

    this.state.update((s) => ({
      ...s,
      cropBox: {
        ...s.cropBox,
        x: newX,
        y: newY,
      },
    }));
  }

  onHandleMouseDown(event: MouseEvent, handle: string): void {
    event.stopPropagation();
    this.currentHandle = handle;
    this.dragStart = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private resizeCropBox(event: MouseEvent, containerRect: DOMRect): void {
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    const cropBox = { ...this.state().cropBox };
    const ratio = this.state().selectedRatio;

    switch (this.currentHandle) {
      case 'e':
        cropBox.width = Math.min(
          Math.max(50, cropBox.width + dx),
          containerRect.width - cropBox.x
        );
        if (ratio) cropBox.height = cropBox.width / ratio;
        break;
      case 'w':
        const newWidth = Math.min(
          Math.max(50, cropBox.width - dx),
          cropBox.x + cropBox.width
        );
        if (newWidth !== cropBox.width) {
          cropBox.x += cropBox.width - newWidth;
          cropBox.width = newWidth;
          if (ratio) cropBox.height = cropBox.width / ratio;
        }
        break;
      case 'n':
        const newHeight = Math.min(
          Math.max(50, cropBox.height - dy),
          cropBox.y + cropBox.height
        );
        if (newHeight !== cropBox.height) {
          cropBox.y += cropBox.height - newHeight;
          cropBox.height = newHeight;
          if (ratio) cropBox.width = cropBox.height * ratio;
        }
        break;
      case 's':
        cropBox.height = Math.min(
          Math.max(50, cropBox.height + dy),
          containerRect.height - cropBox.y
        );
        if (ratio) cropBox.width = cropBox.height * ratio;
        break;
      // Handle corner cases
      case 'nw':
      case 'ne':
      case 'sw':
      case 'se':
        this.handleCornerResize(event, cropBox, containerRect);
        break;
    }

    this.state.update((s) => ({ ...s, cropBox }));
    this.dragStart = { x: event.clientX, y: event.clientY };
  }

  private handleCornerResize(
    event: MouseEvent,
    cropBox: CropBox,
    containerRect: DOMRect
  ): void {
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    const ratio = this.state().selectedRatio;

    switch (this.currentHandle) {
      case 'nw':
        if (ratio) {
          const newWidth = Math.min(
            Math.max(50, cropBox.width - dx),
            cropBox.x + cropBox.width
          );
          cropBox.x += cropBox.width - newWidth;
          cropBox.width = newWidth;
          cropBox.height = cropBox.width / ratio;
          cropBox.y = cropBox.y + (cropBox.height - cropBox.width / ratio);
        } else {
          const newWidth = Math.min(
            Math.max(50, cropBox.width - dx),
            cropBox.x + cropBox.width
          );
          const newHeight = Math.min(
            Math.max(50, cropBox.height - dy),
            cropBox.y + cropBox.height
          );
          cropBox.x += cropBox.width - newWidth;
          cropBox.y += cropBox.height - newHeight;
          cropBox.width = newWidth;
          cropBox.height = newHeight;
        }
        break;
      case 'ne':
        if (ratio) {
          cropBox.width = Math.min(
            Math.max(50, cropBox.width + dx),
            containerRect.width - cropBox.x
          );
          cropBox.height = cropBox.width / ratio;
          cropBox.y = cropBox.y + (cropBox.height - cropBox.width / ratio);
        } else {
          cropBox.width = Math.min(
            Math.max(50, cropBox.width + dx),
            containerRect.width - cropBox.x
          );
          const newHeight = Math.min(
            Math.max(50, cropBox.height - dy),
            cropBox.y + cropBox.height
          );
          cropBox.y += cropBox.height - newHeight;
          cropBox.height = newHeight;
        }
        break;
      case 'sw':
        if (ratio) {
          const newWidth = Math.min(
            Math.max(50, cropBox.width - dx),
            cropBox.x + cropBox.width
          );
          cropBox.x += cropBox.width - newWidth;
          cropBox.width = newWidth;
          cropBox.height = cropBox.width / ratio;
        } else {
          const newWidth = Math.min(
            Math.max(50, cropBox.width - dx),
            cropBox.x + cropBox.width
          );
          cropBox.x += cropBox.width - newWidth;
          cropBox.width = newWidth;
          cropBox.height = Math.min(
            Math.max(50, cropBox.height + dy),
            containerRect.height - cropBox.y
          );
        }
        break;
      case 'se':
        if (ratio) {
          cropBox.width = Math.min(
            Math.max(50, cropBox.width + dx),
            containerRect.width - cropBox.x
          );
          cropBox.height = cropBox.width / ratio;
        } else {
          cropBox.width = Math.min(
            Math.max(50, cropBox.width + dx),
            containerRect.width - cropBox.x
          );
          cropBox.height = Math.min(
            Math.max(50, cropBox.height + dy),
            containerRect.height - cropBox.y
          );
        }
        break;
    }
  }

  setAspectRatio(ratio: number | null): void {
    this.state.update((s) => ({ ...s, selectedRatio: ratio }));
    this.initCropBox();
  }

  setOutputFormat(format: 'jpg' | 'png' | 'webp'): void {
    this.state.update((s) => ({ ...s, selectedFormat: format }));
  }

  rotateLeft(): void {
    this.state.update((s) => ({ ...s, rotation: s.rotation - 90 }));
  }

  rotateRight(): void {
    this.state.update((s) => ({ ...s, rotation: s.rotation + 90 }));
  }

  async cropImage(): Promise<void> {
    const img = this.sourceImage.nativeElement;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to crop box size
    canvas.width = this.state().cropBox.width;
    canvas.height = this.state().cropBox.height;

    // Calculate scale factor between natural image size and displayed size
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Apply rotation if needed
    if (this.state().rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((this.state().rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped portion
    ctx.drawImage(
      img,
      this.state().cropBox.x * scaleX,
      this.state().cropBox.y * scaleY,
      this.state().cropBox.width * scaleX,
      this.state().cropBox.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (this.state().rotation !== 0) {
      ctx.restore();
    }

    // Convert to blob and create URL
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(
        (b) => resolve(b!),
        `image/${this.state().selectedFormat}`,
        0.9
      )
    );

    const croppedUrl = URL.createObjectURL(blob);
    this.state.update((s) => ({ ...s, croppedImage: croppedUrl }));
  }

  downloadImage(): void {
    const croppedImage = this.state().croppedImage;
    if (!croppedImage) return;

    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `cropped-image.${this.state().selectedFormat}`;
    link.click();
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
    const originalImage = this.state().originalImage;
    const croppedImage = this.state().croppedImage;

    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    if (croppedImage) {
      URL.revokeObjectURL(croppedImage);
    }
  }
}
