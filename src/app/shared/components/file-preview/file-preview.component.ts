import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FilePreview {
  file: File;
  preview?: string;
}

@Component({
  selector: 'app-file-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <div class="preview-list">
        <div *ngFor="let item of files; let i = index" class="preview-item">
          <div class="preview-content">
            <img
              *ngIf="item.preview"
              [src]="item.preview"
              [alt]="item.file.name"
            />
            <div class="file-info">
              <span class="file-name">{{ item.file.name }}</span>
              <span class="file-size">{{
                formatFileSize(item.file.size)
              }}</span>
            </div>
          </div>
          <button class="remove-btn" (click)="removeFile(i)">×</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./file-preview.component.css'],
})
export class FilePreviewComponent {
  @Input() files: FilePreview[] = [];
  @Output() fileRemoved = new EventEmitter<number>();

  removeFile(index: number) {
    this.fileRemoved.emit(index);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
