import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-overlay" [class.show]="show">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ message }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./loading.component.css'],
})
export class LoadingComponent {
  @Input() show = false;
  @Input() message = 'Loading...';
}
