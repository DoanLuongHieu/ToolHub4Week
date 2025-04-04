import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'vi' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<Language>('vi');
  private translateService = inject(TranslateService);

  constructor() {}

  getCurrentLang() {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('language', lang);
    this.translateService.use(lang);
  }

  initLanguage() {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      this.currentLang.set(savedLang);
      this.translateService.use(savedLang);
    } else {
      // Mặc định là tiếng Việt
      this.translateService.use('vi');
    }
  }
}