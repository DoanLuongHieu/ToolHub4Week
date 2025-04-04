import { signal, type Signal } from '@angular/core';

interface ConversionState {
  isConverting: boolean;
  error: string | null;
  progress: number;
  originalFile: File | null;
  convertedUrl: string | null;
  apiAvailable: boolean;
}

export class WordToPdfState {
  private _state = signal<ConversionState>({
    isConverting: false,
    error: null,
    progress: 0,
    originalFile: null,
    convertedUrl: null,
    apiAvailable: false,
  });

  /**
   * Get the current state
   */
  public state(): Signal<ConversionState> {
    return this._state.asReadonly();
  }

  /**
   * Update the state
   * @param updater Function that receives the current state and returns a new state
   */
  public update(updater: (state: ConversionState) => ConversionState): void {
    this._state.update(updater);
  }

  /**
   * Access the current state value
   */
  public call(): ConversionState {
    return this._state();
  }
}
