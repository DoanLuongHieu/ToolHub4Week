import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="loading-overlay" [class.show]="show">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ message || ('LOADING.DEFAULT' | translate) }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent {
  @Input() show = false;
  @Input() message = '';
}
