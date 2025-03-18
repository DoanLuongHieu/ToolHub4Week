import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingState = signal(false);
  private loadingMessage = signal('Loading...');

  show(message = 'Loading...') {
    this.loadingMessage.set(message);
    this.loadingState.set(true);
  }

  hide() {
    this.loadingState.set(false);
  }

  isLoading() {
    return this.loadingState;
  }

  getMessage() {
    return this.loadingMessage;
  }
}
