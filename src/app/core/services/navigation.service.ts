import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);
  private location = inject(Location);

  navigateTo(path: string[], queryParams?: Record<string, string>) {
    this.router.navigate(path, { queryParams });
  }

  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  getCurrentUrl(): string {
    return this.router.url;
  }
}
