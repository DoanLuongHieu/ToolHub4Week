import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../core/services/error.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="errorService.getErrorState()().show"
      class="error-container"
      [class]="errorService.getErrorState()().type"
    >
      <div class="error-content">
        <span class="error-message">
          {{ errorService.getErrorState()().message }}
        </span>
        <button class="close-btn" (click)="errorService.hide()">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent {
  protected errorService = inject(ErrorService);
}
