import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  async compressImage(
    file: File,
    quality: number,
    format: 'jpeg' | 'png' | 'webp'
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set white background for JPG
          if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }
              const extension = format === 'jpeg' ? 'jpg' : format;
              const compressedFile = new File(
                [blob],
                `compressed-${file.name.replace(/\.[^/.]+$/, '')}.${extension}`,
                {
                  type: `image/${format}`,
                }
              );
              resolve(compressedFile);
            },
            `image/${format}`,
            quality / 100 // Convert quality percentage to 0-1 range
          );
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }

  // Calculate file size in KB
  getFileSizeInKB(file: File): number {
    return Math.round(file.size / 1024);
  }
}
