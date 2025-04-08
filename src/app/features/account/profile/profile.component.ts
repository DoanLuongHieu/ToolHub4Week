import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { PersonalInfoComponent } from '../personal-info/personal-info.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PersonalInfoComponent,
    ChangePasswordComponent,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'personal-info' | 'change-password' = 'personal-info';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Đảm bảo người dùng đã đăng nhập, nếu không chuyển về trang đăng nhập
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/features/authentication/login']);
        return;
      }
      this.currentUser = user;
    });

    // Kiểm tra tab từ query params
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'change-password') {
        this.activeTab = 'change-password';
      } else {
        this.activeTab = 'personal-info';
      }
    });
  }

  setActiveTab(tab: 'personal-info' | 'change-password'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });
  }
}
