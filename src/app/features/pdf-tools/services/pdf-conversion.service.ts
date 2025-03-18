import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PdfConversionService {
  private readonly apiUrl = '/api';

  constructor(private http: HttpClient) {}

  async convertPdfToExcel(
    file: File,
    outputFormat: 'xlsx' | 'csv'
  ): Promise<File> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', outputFormat);

    try {
      const response = await fetch('/api/convert/pdf-to-excel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const blob = await response.blob();
      return new File([blob], `converted.${outputFormat}`, {
        type:
          outputFormat === 'xlsx'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv',
      });
    } catch (error) {
      console.error('Error converting file:', error);
      throw error;
    }
  }
}
