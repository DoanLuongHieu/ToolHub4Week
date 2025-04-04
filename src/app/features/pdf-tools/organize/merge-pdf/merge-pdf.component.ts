import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-merge-pdf',
  standalone: true,
  imports: [CommonModule, DragDropModule, TranslateModule],
  templateUrl: './merge-pdf.component.html',
  styleUrl: './merge-pdf.component.css',
})
export class MergePdfComponent {
  selectedFiles: File[] = [];
  isDragging = signal(false);
  isProcessing = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = Array.from(event.dataTransfer?.files || []).filter(
      (file) => file.type === 'application/pdf'
    );

    if (files.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...files];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files).filter(
        (file) => file.type === 'application/pdf'
      );
      this.selectedFiles = [...this.selectedFiles, ...files];
    }
  }

  removeFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  clearFiles(): void {
    this.selectedFiles = [];
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.selectedFiles,
      event.previousIndex,
      event.currentIndex
    );
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async mergePDFs(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    try {
      this.isProcessing.set(true);
      const mergedPdf = await PDFDocument.create();

      for (const file of this.selectedFiles) {
        const fileArrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileArrayBuffer);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      saveAs(blob, 'merged-document.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      // Here you could add a proper error handling UI
    } finally {
      this.isProcessing.set(false);
    }
  }
}
