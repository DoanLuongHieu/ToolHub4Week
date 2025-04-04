import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme = signal<boolean>(this.getInitialTheme());

  private getInitialTheme(): boolean {
    // Kiểm tra theme từ localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }

    // Hoặc sử dụng tùy chọn màu từ thiết bị
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme() {
    const newTheme = !this.isDarkTheme();
    this.isDarkTheme.set(newTheme);
    this.applyTheme(newTheme);
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  getCurrentTheme() {
    return this.isDarkTheme;
  }

  initTheme() {
    this.applyTheme(this.isDarkTheme());
    
    // Lắng nghe sự thay đổi theme hệ thống
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('theme') === null) {
        const isDark = e.matches;
        this.isDarkTheme.set(isDark);
        this.applyTheme(isDark);
      }
    });
  }
}
