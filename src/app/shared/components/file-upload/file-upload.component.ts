import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePreviewComponent } from '../file-preview/file-preview.component';

interface FilePreview {
  file: File;
  preview?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FilePreviewComponent],
  template: `
    <div
      class="upload-container"
      [class.drag-over]="isDragOver"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <div class="upload-content">
        <i class="upload-icon"></i>
        <h3>{{ title }}</h3>
        <p>Drag & drop files here or</p>
        <input
          type="file"
          [accept]="accept"
          [multiple]="multiple"
          (change)="onFileSelected($event)"
          #fileInput
          hidden
        />
        <button class="browse-btn" (click)="fileInput.click()">
          Browse Files
        </button>
        <p class="file-info" *ngIf="maxSize">
          Maximum file size: {{ maxSize }}MB
        </p>
      </div>
    </div>
    <app-file-preview
      [files]="selectedFiles"
      (fileRemoved)="removeFile($event)"
    />
  `,
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent {
  @Input() title = 'Upload Files';
  @Input() accept = '*/*';
  @Input() multiple = false;
  @Input() maxSize?: number;

  @Output() filesSelected = new EventEmitter<File[]>();

  isDragOver = false;
  selectedFiles: FilePreview[] = [];

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    if (this.validateFiles(files)) {
      this.addFiles(files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (this.validateFiles(files)) {
      this.addFiles(files);
    }
    input.value = ''; // Reset input
  }

  private validateFiles(files: File[]): boolean {
    if (this.maxSize) {
      const invalidFiles = files.filter(
        (file) => file.size > this.maxSize! * 1024 * 1024
      );

      if (invalidFiles.length > 0) {
        alert(`Some files exceed the maximum size of ${this.maxSize}MB`);
        return false;
      }
    }
    return true;
  }

  async addFiles(files: File[]) {
    for (const file of files) {
      const preview = await this.createPreview(file);
      this.selectedFiles.push({ file, preview });
    }
    this.filesSelected.emit(files);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.filesSelected.emit(this.selectedFiles.map((f) => f.file));
  }

  private async createPreview(file: File): Promise<string | undefined> {
    if (!file.type.startsWith('image/')) return undefined;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }
}
