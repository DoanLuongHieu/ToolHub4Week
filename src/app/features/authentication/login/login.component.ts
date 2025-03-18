import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    // Kiểm tra trạng thái trước đó
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.successMessage = 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.';
      }
    });
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isSubmitting = false;
        // Chuyển hướng đến trang chính sau khi đăng nhập
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
        console.error('Lỗi đăng nhập:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.isSubmitting = false;
        // Chuyển hướng đến trang chính sau khi đăng nhập
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.message === 'Tài khoản chưa được đăng ký. Vui lòng đăng ký trước.') {
          // Nếu tài khoản chưa đăng ký, chuyển hướng đến trang đăng ký
          this.router.navigate(['/features/authentication/register']);
        } else {
          this.errorMessage = 'Đăng nhập với Google thất bại: ' + error.message;
        }
        console.error('Lỗi đăng nhập Google:', error);
      }
    });
  }
}
