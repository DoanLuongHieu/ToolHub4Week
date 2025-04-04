import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WordConversionService {
  private readonly apiUrl = 'http://localhost:5000/api'; // URL máy chủ Flask

  constructor(private http: HttpClient) {}

  /**
   * Kiểm tra trạng thái của server API
   */
  checkApiStatus(): Observable<boolean> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`).pipe(
      map((response) => response.status === 'ok'),
      catchError((error) => {
        console.error('API Health Check Error:', error);
        return throwError(
          () =>
            'PDF_TOOLS.TO_PDF_CONVERTERS.FROM_WORD.API_ERRORS.SERVER_UNAVAILABLE'
        );
      })
    );
  }

  /**
   * Chuyển đổi file Word sang PDF
   * @param file File Word cần chuyển đổi
   */
  convertWordToPdf(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post(`${this.apiUrl}/convert-word-to-pdf`, formData, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        map((event: HttpEvent<Blob>) => {
          if (event.type === HttpEventType.Response) {
            return event.body as Blob;
          }
          return new Blob();
        }),
        catchError((error) => {
          console.error('Word to PDF Conversion Error:', error);
          return throwError(
            () =>
              'PDF_TOOLS.TO_PDF_CONVERTERS.FROM_WORD.API_ERRORS.CONVERSION_ERROR'
          );
        })
      );
  }
}
