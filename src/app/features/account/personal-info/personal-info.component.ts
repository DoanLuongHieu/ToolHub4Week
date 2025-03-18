import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../../services/auth.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
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
    private authService: AuthService
  ) { }

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
      instagramUrl: [this.user.instagramUrl || '', []]
    });
  }
  
  onSubmit(): void {
    if (this.personalForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Cập nhật ảnh đại diện trước (nếu có)
    if (this.selectedFile) {
      this.uploadProfilePhoto();
    } else {
      this.updateUserProfile();
    }
  }
  
  private updateUserProfile(): void {
    const profileData = {
      ...this.personalForm.value
    };
    
    this.authService.updateUserProfile(this.user.id, profileData).subscribe({
      next: (updatedUser) => {
        this.isSubmitting = false;
        this.successMessage = 'Cập nhật thông tin thành công';
        this.user = updatedUser;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Cập nhật thông tin thất bại: ' + error.message;
      }
    });
  }
  
  // Xử lý sự kiện khi người dùng chọn file ảnh
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Hiển thị xem trước ảnh
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedPhotoURL = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  // Trong môi trường thực tế, bạn sẽ upload ảnh lên server
  // Đây là mô phỏng việc upload và nhận URL ảnh từ server
  private uploadProfilePhoto(): void {
    // Mô phỏng việc upload ảnh và nhận URL từ server
    setTimeout(() => {
      // Giả định URL ảnh từ server là selectedPhotoURL
      const photoURL = this.selectedPhotoURL;
      
      // Cập nhật ảnh đại diện
      this.authService.updateProfilePhoto(this.user.id, photoURL || '').subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          // Tiếp tục cập nhật thông tin còn lại
          this.updateUserProfile();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = 'Cập nhật ảnh đại diện thất bại: ' + error.message;
        }
      });
    }, 1000); // Mô phỏng độ trễ mạng
  }
  
  // Xóa ảnh đã chọn
  clearSelectedPhoto(): void {
    this.selectedFile = null;
    this.selectedPhotoURL = null;
  }
}
