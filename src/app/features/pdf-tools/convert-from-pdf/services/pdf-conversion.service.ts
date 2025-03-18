import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PdfConversionService {
  private readonly apiUrl = 'http://localhost:5000/api'; // URL máy chủ Flask

  constructor(private http: HttpClient) {}

  /**
   * Kiểm tra trạng thái của server API
   */
  checkApiStatus(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`).pipe(
      map(response => response.status === 'ok'),
      catchError(error => {
        console.error('API Health Check Error:', error);
        return throwError(() => 'Không thể kết nối đến máy chủ chuyển đổi PDF');
      })
    );
  }

  /**
   * Chuyển đổi file PDF sang Word
   * @param file File PDF cần chuyển đổi
   */
  convertPdfToWord(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/convert-pdf-to-word`, formData, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<Blob>) => {
        if (event.type === HttpEventType.Response) {
          return event.body as Blob;
        }
        return new Blob();
      }),
      catchError(error => {
        console.error('PDF to Word Conversion Error:', error);
        return throwError(() => 'Không thể chuyển đổi file PDF sang Word. Vui lòng thử lại sau.');
      })
    );
  }
}
