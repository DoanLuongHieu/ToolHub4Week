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
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../models/user.model';
import { DropdownState } from '../../../models/ui.model';
// import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ClickOutsideDirective, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: [
    './header.component.css',
    '../../styles/icons.css',
    '../../styles/social-icons.css',
  ],
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  protected languageService = inject(LanguageService);
  private router = inject(Router);

  currentLang = this.languageService.getCurrentLang();
  currentUser: User | null = null;
  isDarkMode = this.themeService.getCurrentTheme();

  isDropdownOpen: DropdownState = {
    pdf: false,
    image: false,
    others: false,
    tools: false,
    user: false,
    account: false,
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
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.languageService.setLanguage(select.value as Language);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
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

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Đăng xuất thất bại:', error);
      },
    });
  }

  // Lấy avatar mặc định nếu người dùng không có avatar
  getDefaultAvatar(username: string): string {
    return `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
  }
}
