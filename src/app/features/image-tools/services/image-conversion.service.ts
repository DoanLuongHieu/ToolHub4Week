import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageConversionService {
  async convertToPng(file: File): Promise<File> {
    return this.convertImage(file, 'png');
  }

  async convertToWebp(file: File): Promise<File> {
    return this.convertImage(file, 'webp');
  }

  async convertToJpg(file: File): Promise<File> {
    return this.convertImage(file, 'jpeg');
  }

  private async convertImage(
    file: File,
    format: 'png' | 'webp' | 'jpeg'
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

          // Set white background for JPG conversion
          if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not convert image'));
                return;
              }
              const extension = format === 'jpeg' ? 'jpg' : format;
              const convertedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, `.${extension}`),
                {
                  type: `image/${format}`,
                }
              );
              resolve(convertedFile);
            },
            `image/${format}`,
            format === 'jpeg' ? 0.95 : undefined
          );
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }
}
