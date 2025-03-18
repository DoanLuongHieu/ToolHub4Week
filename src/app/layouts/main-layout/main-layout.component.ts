import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../core/services/loading.service';
import { ErrorComponent } from '../../shared/components/error/error.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoadingComponent,
    ErrorComponent,
  ],
  template: `
    <div class="layout">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-loading
        [show]="loadingService.isLoading()()"
        [message]="loadingService.getMessage()()"
      />
      <app-error />
    </div>
  `,
  styleUrls: ['./main-layout.component.css'],
})
export class MainLayoutComponent {
  protected loadingService = inject(LoadingService);
}
