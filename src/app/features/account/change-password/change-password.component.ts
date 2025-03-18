import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  @Input() userId!: string;
  
  passwordForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  // Validator để kiểm tra mật khẩu mới và xác nhận mật khẩu khớp nhau
  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { mismatch: true };
  }
  
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    this.authService.changePassword(this.userId, currentPassword, newPassword).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.';
        
        // Chuyển hướng về trang đăng nhập sau 2 giây
        setTimeout(() => {
          this.router.navigate(['/features/authentication/login']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Đổi mật khẩu thất bại: ' + error.message;
      }
    });
  }
  
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  
  // Kiểm tra lỗi cho trường mật khẩu
  getPasswordError(): string {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required') && control.touched) {
      return 'Vui lòng nhập mật khẩu mới';
    }
    if (control?.hasError('minlength') && control.touched) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return '';
  }
  
  // Kiểm tra lỗi cho trường xác nhận mật khẩu
  getConfirmPasswordError(): string {
    if (this.passwordForm.hasError('mismatch') && this.passwordForm.get('confirmPassword')?.touched) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  }
}
