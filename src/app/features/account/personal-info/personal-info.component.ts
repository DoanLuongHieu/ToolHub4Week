import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
})
export class PersonalInfoComponent implements OnInit {
  @Input() user!: User;

  personalForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Đường dẫn đến ảnh đại diện đã chọn
  selectedPhotoURL: string | null = null;

  // File ảnh đại diện đã chọn
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.personalForm = this.formBuilder.group({
      fullName: [this.user.fullName || '', []],
      birthDate: [this.user.birthDate || '', []],
      gender: [this.user.gender || '', []],
      facebookUrl: [this.user.facebookUrl || '', []],
      youtubeUrl: [this.user.youtubeUrl || '', []],
      twitterUrl: [this.user.twitterUrl || '', []],
      instagramUrl: [this.user.instagramUrl || '', []],
    });
  }

  onSubmit(): void {
    if (this.personalForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Nếu có ảnh mới, cập nhật lên server
    if (this.selectedPhotoURL) {
      this.authService
        .updateProfilePhoto(this.user.id, this.selectedPhotoURL)
        .subscribe();
    }

    this.updateUserProfile();
  }

  private updateUserProfile(): void {
    const profileData = {
      ...this.personalForm.value,
    };

    this.authService.updateUserProfile(this.user.id, profileData).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.successMessage = this.translateService.instant(
          'USER.ACCOUNT.UPDATE_SUCCESS'
        );
        this.user = updatedUser;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          this.translateService.instant('USER.ACCOUNT.UPDATE_ERROR') +
          error.message;
      },
    });
  }

  // Xử lý sự kiện khi người dùng chọn file ảnh
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Kiểm tra kích thước (2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = this.translateService.instant(
          'USER.ACCOUNT.FILE_TOO_LARGE'
        );
        return;
      }

      // Đọc file và hiển thị preview
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhotoURL = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Xóa ảnh đã chọn
  clearSelectedPhoto(): void {
    this.selectedPhotoURL = null;
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
