import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { filter } from 'rxjs/operators';
import {
  LanguageService,
  Language,
} from '../../../core/services/language.service';
import { AuthService, User } from '../../../services/auth.service';
// import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

interface DropdownState {
  pdf: boolean;
  image: boolean;
  others: boolean;
  tools: boolean;
  user: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective],
  templateUrl: './header.component.html',
  styleUrls: [
    './header.component.css',
    '../../styles/icons.css',
    '../../styles/social-icons.css',
  ],
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  isDark = this.themeService.getCurrentTheme();
  currentLang = this.languageService.getCurrentLang();
  currentUser: User | null = null;
  
  isDropdownOpen: DropdownState = {
    pdf: false,
    image: false,
    others: false,
    tools: false,
    user: false
  };

  constructor() {
    // Lắng nghe sự kiện chuyển trang
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Đóng tất cả dropdown khi chuyển trang
        Object.keys(this.isDropdownOpen).forEach((key) => {
          this.isDropdownOpen[key as keyof DropdownState] = false;
        });
      });
      
    // Đăng ký lắng nghe sự thay đổi của người dùng hiện tại
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.languageService.setLanguage(select.value as Language);
  }

  toggleDropdown(type: keyof DropdownState) {
    Object.keys(this.isDropdownOpen).forEach((key) => {
      if (key !== type) {
        this.isDropdownOpen[key as keyof DropdownState] = false;
      }
    });
    this.isDropdownOpen[type] = !this.isDropdownOpen[type];
  }

  closeDropdown(type: keyof DropdownState) {
    this.isDropdownOpen[type] = false;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
  
  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Đăng xuất thất bại:', error);
      }
    });
  }
  
  // Lấy avatar mặc định nếu người dùng không có avatar
  getDefaultAvatar(username: string): string {
    return `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
  }
}
