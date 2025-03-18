import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-complete-gmail-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './complete-gmail-registration.component.html',
  styleUrls: ['./complete-gmail-registration.component.css']
})
export class CompleteGmailRegistrationComponent implements OnInit {
  completeRegistrationForm!: FormGroup;
  email: string = '';
  uid: string = '';
  photoURL: string | null = null;
  displayName: string | null = null;
  showPassword = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private validationService: ValidationService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.uid = params['uid'] || '';
      this.photoURL = params['photo'] || null;
      this.displayName = params['name'] || null;
      
      if (!this.email || !this.uid) {
        this.router.navigate(['/features/authentication/register']);
        return;
      }
      
      this.initForm();
    });
  }

  initForm(): void {
    this.completeRegistrationForm = this.formBuilder.group({
      username: ['', [Validators.required, this.validationService.usernameValidator()]],
      password: ['', [Validators.required, this.validationService.passwordStrengthValidator()]]
    });
  }

  onSubmit(): void {
    if (this.completeRegistrationForm.invalid) {
      this.markFormGroupTouched(this.completeRegistrationForm);
      return;
    }

    // Kiểm tra username đã tồn tại
    const { username } = this.completeRegistrationForm.value;
    if (this.authService.isUsernameTaken(username)) {
      this.errorMessage = 'Tên đăng nhập này đã được sử dụng';
      return;
    }

    this.isSubmitting = true;
    const registrationData = {
      uid: this.uid,
      email: this.email,
      username: this.completeRegistrationForm.value.username,
      ...(this.photoURL && { photoURL: this.photoURL }),
      ...(this.displayName && { displayName: this.displayName })
    };

    this.authService.completeGoogleRegistration(registrationData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/features/authentication/login'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Đăng ký thất bại: ' + error.message;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getErrorForControl(controlName: string): string {
    const control = this.completeRegistrationForm.get(controlName);
    if (control && control.touched && control.errors) {
      return this.validationService.getErrorMessage(control.errors);
    }
    return '';
  }

  // Đánh dấu tất cả các control là đã touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
} 