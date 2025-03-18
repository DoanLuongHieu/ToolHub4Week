import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, PDFName, PDFDict, PDFRef, PDFObject } from 'pdf-lib';

interface CompressionState {
  isCompressing: boolean;
  error: string | null;
  originalFile: File | null;
  compressedFile: Uint8Array | null;
  originalSize: number | null;
  compressedSize: number | null;
  quality: number;
  removeMetadata: boolean;
}

@Component({
  selector: 'app-compress-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compress-pdf.component.html',
  styleUrl: './compress-pdf.component.css',
})
export class CompressPdfComponent {
  state = signal<CompressionState>({
    isCompressing: false,
    error: null,
    originalFile: null,
    compressedFile: null,
    originalSize: null,
    compressedSize: null,
    quality: 80,
    removeMetadata: true,
  });

  isDragging = false;

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
        error: 'Please select a PDF file',
      }));
      return;
    }

    try {
      this.state.update((state) => ({
        ...state,
        originalFile: file,
        originalSize: this.getFileSizeInKB(file),
        error: null,
        compressedFile: null,
        compressedSize: null,
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        error: 'Error loading PDF file',
      }));
    }
  }

  async compressPDF(): Promise<void> {
    const file = this.state().originalFile;
    if (!file) return;

    try {
      this.state.update((state) => ({
        ...state,
        isCompressing: true,
        error: null,
      }));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Tối ưu hóa hình ảnh
      for (const page of pages) {
        const resources = page.node.Resources();
        if (!resources) continue;

        const xObjects = resources.lookup(PDFName.of('XObject'));
        if (!(xObjects instanceof PDFDict)) continue;

        // Sử dụng phương thức an toàn để truy cập entries
        const entries = xObjects.entries();
        for (const [name, xObjectRef] of entries) {
          if (!(xObjectRef instanceof PDFRef)) continue;

          const xObject = pdfDoc.context.lookup(xObjectRef);
          if (!xObject || xObject.constructor.name !== 'PDFImage') continue;

          try {
            const quality = this.state().quality / 100;
            const { width, height } = this.calculateOptimalDimensions(
              page.getWidth(),
              page.getHeight(),
              this.state().quality
            );

            // Tạo một hình ảnh mới với kích thước đã tối ưu
            const imageBytes = await pdfDoc.embedJpg(
              new Uint8Array(await file.arrayBuffer())
            );
            page.drawImage(imageBytes, {
              x: 0,
              y: 0,
              width,
              height,
              opacity: quality,
            });
          } catch (error) {
            console.warn('Error processing image:', error);
            continue;
          }
        }
      }

      // Tối ưu font chữ
      for (const page of pages) {
        const resources = page.node.Resources();
        if (!resources) continue;

        const fonts = resources.lookup(PDFName.of('Font'));
        if (!(fonts instanceof PDFDict)) continue;

        // Sử dụng phương thức an toàn để truy cập entries
        const entries = fonts.entries();
        for (const [name, fontRef] of entries) {
          if (!(fontRef instanceof PDFRef)) continue;

          const font = pdfDoc.context.lookup(fontRef);
          if (!font) continue;

          if (this.state().quality < 80) {
            // Áp dụng subset cho font nếu quality thấp
            if (font instanceof PDFDict) {
              font.set(PDFName.of('Subset'), PDFName.of('true'));
            }
          }
        }
      }

      // Remove metadata nếu được chọn
      if (this.state().removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      // Tùy chọn nén
      const compressionOptions = {
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerStream: Math.floor(50 * (this.state().quality / 100)),
        compress: true,
        compressStreams: true,
        linearize: this.state().quality < 50,
        removeUnusedObjects: true,
        preserveObjectIds: this.state().quality > 80,
      };

      const compressedPdf = await pdfDoc.save(compressionOptions);

      this.state.update((state) => ({
        ...state,
        isCompressing: false,
        compressedFile: compressedPdf,
        compressedSize: this.getArrayBufferSizeInKB(compressedPdf),
      }));
    } catch (error) {
      console.error('Compression error:', error);
      this.state.update((state) => ({
        ...state,
        isCompressing: false,
        error: 'Error compressing PDF. Please try again.',
      }));
    }
  }

  private getFileSizeInKB(file: File): number {
    return Math.round(file.size / 1024);
  }

  private getArrayBufferSizeInKB(buffer: Uint8Array): number {
    return Math.round(buffer.byteLength / 1024);
  }

  getCompressionRatio(): string {
    const originalSize = this.state().originalSize;
    const compressedSize = this.state().compressedSize;
    if (!originalSize || !compressedSize) return '0';
    return Math.round((1 - compressedSize / originalSize) * 100).toString();
  }

  updateQuality(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.state.update((state) => ({
      ...state,
      quality: Number(input.value),
    }));
  }

  toggleMetadata(): void {
    this.state.update((state) => ({
      ...state,
      removeMetadata: !state.removeMetadata,
    }));
  }

  downloadPDF(): void {
    const compressedFile = this.state().compressedFile;
    const originalFile = this.state().originalFile;
    if (!compressedFile || !originalFile) return;

    const blob = new Blob([compressedFile], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const originalName = originalFile.name;
    const compressedName = originalName.replace('.pdf', '-compressed.pdf');
    link.download = compressedName;
    link.click();
    URL.revokeObjectURL(url);
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

  // Thêm phương thức mới để tính toán kích thước tối ưu
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    quality: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Giảm kích thước dựa trên quality
    if (quality < 100) {
      const scaleFactor = 0.5 + quality / 200; // Tỷ lệ từ 0.5 đến 1
      newWidth = Math.floor(originalWidth * scaleFactor);
      newHeight = Math.floor(newWidth / aspectRatio);
    }

    return { width: newWidth, height: newHeight };
  }
}
