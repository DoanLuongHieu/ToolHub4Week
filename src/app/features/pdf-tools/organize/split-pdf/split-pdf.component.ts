import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { TranslateModule } from '@ngx-translate/core';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf/pdf.worker.min.js';

interface PdfPage {
  pageNumber: number;
  selected: boolean;
  thumbnail?: string;
  dataUrl?: string;
}

interface PageRange {
  start: number;
  end: number;
}

@Component({
  selector: 'app-split-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TranslateModule],
  templateUrl: './split-pdf.component.html',
  styleUrl: './split-pdf.component.css',
})
export class SplitPdfComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('previewCanvas') previewCanvas!: ElementRef<HTMLCanvasElement>;

  selectedFile: File | null = null;
  pdfPages: PdfPage[] = [];
  totalPages: number = 0;
  pageRangeInput: string = '';
  isProcessing: boolean = false;
  errorMessage: string = '';
  dragEnabled: boolean = false;
  pdfDoc: PDFDocument | null = null;
  pdfJsDoc: any = null;
  previewScale: number = 1.5;
  selectedPreviewPage: number | null = null;

  // Store split configurations
  splitConfigs: PageRange[] = [];

  constructor(private ngZone: NgZone) {}

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      await this.loadPdfPages();
    }
  }

  async loadPdfPages(): Promise<void> {
    if (!this.selectedFile) return;

    this.isProcessing = true;
    try {
      // Load with pdf-lib for splitting
      const arrayBuffer = await this.selectedFile.arrayBuffer();
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      this.totalPages = this.pdfDoc.getPageCount();

      // Load with PDF.js for previews
      const pdfJsDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
      this.pdfJsDoc = pdfJsDoc;

      // Initialize pages array
      this.pdfPages = Array.from({ length: this.totalPages }, (_, i) => ({
        pageNumber: i + 1,
        selected: false,
      }));

      // Generate thumbnails
      await this.generatePreviews();

      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error loading PDF file. Please try again.';
      console.error('Error loading PDF:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async generatePreviews(): Promise<void> {
    if (!this.pdfJsDoc) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    for (let i = 0; i < this.totalPages; i++) {
      const page = await this.pdfJsDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale for thumbnails

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      this.pdfPages[i].dataUrl = canvas.toDataURL();
    }
  }

  async showPagePreview(pageNumber: number): Promise<void> {
    if (!this.pdfJsDoc) return;

    this.selectedPreviewPage = pageNumber;
    const page = await this.pdfJsDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: this.previewScale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Update preview modal with the rendered page
    const previewImage = document.getElementById(
      'previewImage'
    ) as HTMLImageElement;
    if (previewImage) {
      previewImage.src = canvas.toDataURL();
    }
  }

  closePreview(): void {
    this.selectedPreviewPage = null;
  }

  parsePageRanges(): void {
    try {
      this.splitConfigs = [];
      const ranges = this.pageRangeInput
        .split(',')
        .map((range) => range.trim());

      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range
            .split('-')
            .map((num) => parseInt(num.trim()));
          if (
            isNaN(start) ||
            isNaN(end) ||
            start < 1 ||
            end > this.totalPages ||
            start > end
          ) {
            throw new Error('Invalid page range');
          }
          this.splitConfigs.push({ start, end });
        } else {
          const page = parseInt(range);
          if (isNaN(page) || page < 1 || page > this.totalPages) {
            throw new Error('Invalid page number');
          }
          this.splitConfigs.push({ start: page, end: page });
        }
      }

      this.errorMessage = '';
    } catch (error) {
      this.errorMessage =
        'Invalid page range format. Please use format like: 1-3, 5, 7-9';
    }
  }

  togglePageSelection(page: PdfPage): void {
    page.selected = !page.selected;
    if (page.selected) {
      this.showPagePreview(page.pageNumber);
    }
  }

  selectAllPages(): void {
    this.pdfPages.forEach((page) => (page.selected = true));
  }

  deselectAllPages(): void {
    this.pdfPages.forEach((page) => (page.selected = false));
  }

  onDrop(event: CdkDragDrop<PdfPage[]>): void {
    moveItemInArray(this.pdfPages, event.previousIndex, event.currentIndex);
  }

  async splitPdf(): Promise<void> {
    if (!this.selectedFile || !this.pdfDoc || this.splitConfigs.length === 0)
      return;

    this.isProcessing = true;
    try {
      for (const config of this.splitConfigs) {
        const newPdf = await PDFDocument.create();

        for (let i = config.start; i <= config.end; i++) {
          const [copiedPage] = await newPdf.copyPages(this.pdfDoc, [i - 1]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.selectedFile.name.replace('.pdf', '')}_pages_${
          config.start
        }-${config.end}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      this.errorMessage = '';
    } catch (error) {
      this.errorMessage = 'Error splitting PDF. Please try again.';
      console.error('Error splitting PDF:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  resetTool(): void {
    this.selectedFile = null;
    this.pdfPages = [];
    this.totalPages = 0;
    this.pageRangeInput = '';
    this.splitConfigs = [];
    this.errorMessage = '';
    this.isProcessing = false;
    this.pdfDoc = null;
    this.pdfJsDoc = null;
    this.selectedPreviewPage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
