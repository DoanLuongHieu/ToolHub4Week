// import { Component, inject } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import {
//   LanguageService,
//   Language,
// } from '../../../core/services/language.service';
// import { ThemeService } from '../../../core/services/theme.service';
// import { ClickOutsideDirective } from '../../directives/click-outside.directive';

// @Component({
//   selector: 'app-mobile-menu',
//   standalone: true,
//   imports: [RouterLink],
//   template: `
//     <div class="mobile-menu" [class.show]="isOpen">
//       <div class="mobile-menu-header">
//         <button class="close-btn" (click)="close()">×</button>
//       </div>

//       <nav class="mobile-nav">
//         <div class="mobile-section">
//           <h3>PDF Tools</h3>
//           <a routerLink="/pdf/to-word" (click)="close()">PDF to Word</a>
//           <a routerLink="/pdf/to-excel" (click)="close()">PDF to Excel</a>
//           <a routerLink="/pdf/to-ppt" (click)="close()">PDF to PPT</a>
//         </div>

//         <div class="mobile-section">
//           <h3>Image Tools</h3>
//           <a routerLink="/image/to-jpg" (click)="close()">To JPG</a>
//           <a routerLink="/image/to-png" (click)="close()">To PNG</a>
//           <a routerLink="/image/to-webp" (click)="close()">To WebP</a>
//         </div>

//         <div class="mobile-section">
//           <h3>Document Tools</h3>
//           <a routerLink="/doc/merge-word" (click)="close()">Merge Word</a>
//           <a routerLink="/doc/split-word" (click)="close()">Split Word</a>
//         </div>

//         <div class="mobile-settings">
//           <select
//             class="language-select"
//             [value]="currentLang()"
//             (change)="onLanguageChange($event)"
//           >
//             <option value="vi">Tiếng Việt</option>
//             <option value="en">English</option>
//           </select>

//           <button class="theme-toggle" (click)="toggleTheme()">
//             <i [class]="isDark() ? 'moon-icon' : 'sun-icon'"></i>
//           </button>
//         </div>
//       </nav>
//     </div>
//   `,
//   styleUrl: './mobile-menu.component.css',
// })
// export class MobileMenuComponent {
//   private themeService = inject(ThemeService);
//   private languageService = inject(LanguageService);

//   isOpen = false;
//   isDark = this.themeService.getCurrentTheme();
//   currentLang = this.languageService.getCurrentLang();

//   open() {
//     this.isOpen = true;
//     document.body.style.overflow = 'hidden';
//   }

//   close() {
//     this.isOpen = false;
//     document.body.style.overflow = 'auto';
//   }

//   toggleTheme() {
//     this.themeService.toggleTheme();
//   }

//   onLanguageChange(event: Event) {
//     const select = event.target as HTMLSelectElement;
//     this.languageService.setLanguage(select.value as Language);
//   }
// }
