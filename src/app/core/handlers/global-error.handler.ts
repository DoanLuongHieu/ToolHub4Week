import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorService } from '../services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorService = inject(ErrorService);

  handleError(error: Error) {
    console.error('An error occurred:', error);

    // Không hiển thị stack trace cho user
    let userMessage = 'An unexpected error occurred';

    if (error.message) {
      userMessage = this.sanitizeErrorMessage(error.message);
    }

    this.errorService.showError(userMessage);
  }

  private sanitizeErrorMessage(message: string): string {
    // Loại bỏ thông tin nhạy cảm từ error message
    return message.replace(/[A-Za-z0-9+/=]/g, '*');
  }
}
