import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  constructor() { }

  // Kiểm tra định dạng email hợp lệ
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(control.value) ? null : { invalidEmail: true };
    };
  }

  // Kiểm tra username hợp lệ (chỉ chữ cái, số và gạch dưới, từ 3-20 ký tự)
  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
      return usernamePattern.test(control.value) ? null : { invalidUsername: true };
    };
  }

  // Kiểm tra mật khẩu mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const password = control.value;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasMinLength = password.length >= 8;
      
      const passwordValid = hasUpperCase && hasLowerCase && hasDigit && hasMinLength;
      
      if (!passwordValid) {
        return {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasDigit,
            hasMinLength
          }
        };
      }
      
      return null;
    };
  }

  // Kiểm tra hai mật khẩu trùng khớp
  matchPasswordValidator(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordControl = formGroup.get(passwordControlName);
      const confirmPasswordControl = formGroup.get(confirmPasswordControlName);

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      if (!confirmPasswordControl.value) {
        return null;
      }

      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      // Xóa lỗi passwordMismatch nếu mật khẩu khớp
      const errors = { ...confirmPasswordControl.errors };
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
      }

      return null;
    };
  }

  // Lấy thông báo lỗi cho các trường hợp validation
  getErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Trường này không được để trống';
    }

    if (errors['invalidEmail']) {
      return 'Email không đúng định dạng';
    }

    if (errors['invalidUsername']) {
      return 'Tên đăng nhập chỉ được chứa chữ cái, số và gạch dưới, độ dài 3-20 ký tự';
    }

    if (errors['passwordStrength']) {
      const strength = errors['passwordStrength'];
      if (!strength.hasMinLength) {
        return 'Mật khẩu phải có ít nhất 8 ký tự';
      }
      if (!strength.hasUpperCase || !strength.hasLowerCase || !strength.hasDigit) {
        return 'Mật khẩu phải có ít nhất một chữ hoa, một chữ thường và một số';
      }
    }

    if (errors['passwordMismatch']) {
      return 'Mật khẩu xác nhận không khớp';
    }

    return 'Trường này không hợp lệ';
  }
} 