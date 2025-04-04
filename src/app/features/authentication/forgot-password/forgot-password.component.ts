import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  isSubmitting = false;
  messageSuccess = '';
  messageError = '';

  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private translateService: TranslateService
  ) {
    this.initForm();
  }

  initForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: [
        '',
        [Validators.required, this.validationService.emailValidator()],
      ],
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Mô phỏng gửi email khôi phục mật khẩu
    setTimeout(() => {
      this.isSubmitting = false;
      this.messageSuccess = this.translateService.instant(
        'AUTH.FORGOT_PASSWORD.SUCCESS_MESSAGE'
      );
      this.forgotPasswordForm.reset();
    }, 1500);
  }

  getErrorForControl(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (control && control.touched && control.errors) {
      return this.validationService.getErrorMessage(control.errors);
    }
    return '';
  }
}
