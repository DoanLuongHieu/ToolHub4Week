import { Injectable, signal } from '@angular/core';

export type Language = 'vi' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = signal<Language>('vi');

  getCurrentLang() {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem('language', lang);
  }

  initLanguage() {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      this.currentLang.set(savedLang);
    }
  }
}