import { Injectable, signal } from '@angular/core';

export interface ErrorState {
  show: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private errorState = signal<ErrorState>({
    show: false,
    message: '',
    type: 'error',
  });

  private autoHideTimeout?: number;

  showError(message: string, duration = 5000) {
    this.errorState.set({
      show: true,
      message,
      type: 'error',
    });

    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }

    if (duration > 0) {
      this.autoHideTimeout = window.setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  showWarning(message: string) {
    this.errorState.set({
      show: true,
      message,
      type: 'warning',
    });
  }

  showInfo(message: string) {
    this.errorState.set({
      show: true,
      message,
      type: 'info',
    });
  }

  hide() {
    this.errorState.update((state) => ({ ...state, show: false }));
  }

  getErrorState() {
    return this.errorState;
  }
}
