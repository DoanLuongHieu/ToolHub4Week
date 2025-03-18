import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme = signal<boolean>(this.getInitialTheme());

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme() {
    this.isDarkTheme.update((value) => !value);
    this.applyTheme(this.isDarkTheme());
  }

  private applyTheme(isDark: boolean) {
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    );
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  getCurrentTheme() {
    return this.isDarkTheme;
  }

  initTheme() {
    this.applyTheme(this.isDarkTheme());

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.isDarkTheme.set(e.matches);
          this.applyTheme(e.matches);
        }
      });
  }
}
