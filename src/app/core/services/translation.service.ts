import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translateService = inject(TranslateService);

  /**
   * Lấy bản dịch cho một khóa
   */
  translate(key: string, params?: object): string {
    return this.translateService.instant(key, params);
  }

  /**
   * Lấy tất cả các bản dịch cho ngôn ngữ hiện tại
   */
  getAllTranslations(): any {
    return this.translateService.store.translations[this.translateService.currentLang];
  }

  /**
   * Kiểm tra một khóa dịch có tồn tại hay không
   */
  hasTranslation(key: string): boolean {
    return this.translateService.instant(key) !== key;
  }

  /**
   * Tải bản dịch từ JSON
   */
  loadTranslations(lang: string, translations: any): void {
    this.translateService.setTranslation(lang, translations, true);
  }
} 