import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        email: [
          '',
          [Validators.required, this.validationService.emailValidator()],
        ],
        username: [
          '',
          [Validators.required, this.validationService.usernameValidator()],
        ],
        password: [
          '',
          [
            Validators.required,
            this.validationService.passwordStrengthValidator(),
          ],
        ],
        confirmPassword: ['', Validators.required],
        invitationCode: [''],
      },
      {
        validators: this.validationService.matchPasswordValidator(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Kiểm tra email và username đã tồn tại
    const { email, username } = this.registerForm.value;
    if (this.authService.isEmailTaken(email)) {
      this.errorMessage = this.translateService.instant(
        'AUTH.REGISTER.EMAIL_TAKEN'
      );
      return;
    }

    if (this.authService.isUsernameTaken(username)) {
      this.errorMessage = this.translateService.instant(
        'AUTH.REGISTER.USERNAME_TAKEN'
      );
      return;
    }

    this.isSubmitting = true;
    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/features/authentication/login'], {
          queryParams: { registered: 'true' },
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          this.translateService.instant('AUTH.REGISTER.REGISTRATION_FAILED') +
          error.message;
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  registerWithGoogle(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.registerWithGoogle().subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result.isNewUser) {
          // Người dùng mới - chuyển đến trang hoàn thành đăng ký
          this.router.navigate(
            ['/features/authentication/complete-gmail-registration'],
            {
              queryParams: {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                photo: result.user.photoURL,
              },
            }
          );
        } else {
          // Người dùng đã tồn tại - chuyển đến trang chính
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          this.translateService.instant('AUTH.REGISTER.GOOGLE_REGISTER_ERROR') +
          error.message;
      },
    });
  }

  getErrorForControl(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control && control.touched && control.errors) {
      return this.validationService.getErrorMessage(control.errors);
    }
    return '';
  }

  // Đánh dấu tất cả các control là đã touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
