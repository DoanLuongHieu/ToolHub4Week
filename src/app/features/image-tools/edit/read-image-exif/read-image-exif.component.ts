import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import exifr from 'exifr';

interface ExifState {
  isLoading: boolean;
  error: string | null;
  originalImage: string | null;
  exifData: any | null;
}

interface ExifGroup {
  title: string;
  icon: string;
  data: { label: string; value: any }[];
}

@Component({
  selector: 'app-read-image-exif',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './read-image-exif.component.html',
  styleUrl: './read-image-exif.component.css',
})
export class ReadImageExifComponent {
  state = signal<ExifState>({
    isLoading: false,
    error: null,
    originalImage: null,
    exifData: null,
  });

  isDragging = false;

  async handleFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.state.update((s) => ({ ...s, error: 'Please select a file' }));
      return;
    }

    try {
      this.state.update((s) => ({ ...s, isLoading: true, error: null }));

      // Read EXIF data
      const exifData = await exifr.parse(file);

      // Create object URL for image preview
      const imageUrl = URL.createObjectURL(file);

      this.state.update((s) => ({
        ...s,
        originalImage: imageUrl,
        exifData,
        isLoading: false,
      }));
    } catch (error) {
      this.state.update((s) => ({
        ...s,
        error: 'Error reading EXIF data',
        isLoading: false,
      }));
    }
  }

  hasValidData(group: ExifGroup): boolean {
    return group.data.some((item) => item.value != null);
  }

  getExifGroups(): ExifGroup[] {
    const exifData = this.state().exifData;
    if (!exifData) return [];

    return [
      {
        title: 'Camera Information',
        icon: '📷',
        data: [
          { label: 'Make', value: exifData.Make },
          { label: 'Model', value: exifData.Model },
          { label: 'Software', value: exifData.Software },
        ],
      },
      {
        title: 'Image Settings',
        icon: '⚙️',
        data: [
          { label: 'ISO', value: exifData.ISO },
          {
            label: 'Aperture',
            value: exifData.FNumber ? `f/${exifData.FNumber}` : null,
          },
          {
            label: 'Focal Length',
            value: exifData.FocalLength ? `${exifData.FocalLength}mm` : null,
          },
          {
            label: 'Shutter Speed',
            value: exifData.ExposureTime
              ? `1/${1 / exifData.ExposureTime}`
              : null,
          },
        ],
      },
      {
        title: 'Image Details',
        icon: '🖼️',
        data: [
          { label: 'Width', value: exifData.ExifImageWidth },
          { label: 'Height', value: exifData.ExifImageHeight },
          { label: 'Color Space', value: exifData.ColorSpace },
          { label: 'Bits Per Sample', value: exifData.BitsPerSample },
        ],
      },
      {
        title: 'Date Information',
        icon: '📅',
        data: [
          { label: 'Date Taken', value: exifData.DateTimeOriginal },
          { label: 'Date Modified', value: exifData.ModifyDate },
        ],
      },
      {
        title: 'Location',
        icon: '📍',
        data: [
          { label: 'GPS Latitude', value: exifData.latitude },
          { label: 'GPS Longitude', value: exifData.longitude },
          { label: 'GPS Altitude', value: exifData.GPSAltitude },
        ],
      },
    ];
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
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
  }
}
