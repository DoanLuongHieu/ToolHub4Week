import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 500:
            errorMessage = 'Server error';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      errorService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
