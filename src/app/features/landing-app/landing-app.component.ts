import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-app',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="landing-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>Transform Your Documents With ToolHub4Week</h1>
          <p class="subtitle">
            Professional tools for PDF, Image, and Document conversion - all in
            one place
          </p>
          <div class="cta-buttons">
            <a routerLink="/features/authentication/login" class="cta-primary">Get Started</a>
            <a routerLink="/features/all-tools" class="cta-secondary"
              >Learn More</a
            >
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="features">
        <h2>Our Tools</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon pdf-icon"></div>
            <h3>PDF Tools</h3>
            <p>Convert PDFs to Word, Excel and more</p>
            <a
              routerLink="/features/all-tools"
              fragment="pdf-tools"
              class="feature-link"
              >Explore PDF Tools</a
            >
          </div>

          <div class="feature-card">
            <div class="feature-icon image-icon"></div>
            <h3>Image Tools</h3>
            <p>Compress, convert, and optimize your images</p>
            <a
              routerLink="/features/all-tools"
              fragment="image-tools"
              class="feature-link"
              >Explore Image Tools</a
            >
          </div>

          <div class="feature-card">
            <div class="feature-icon other-icon"></div>
            <h3>Other Tools</h3>
            <p>Other tools for your needs</p>
            <a
              routerLink="/features/all-tools"
              fragment="other-tools"
              class="feature-link"
              >Explore Other Tools</a
            >
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="benefits">
        <h2>Why Choose Us</h2>
        <div class="benefits-grid">
          <div class="benefit-item">
            <h4>Fast & Efficient</h4>
            <p>Convert files in seconds with our optimized tools</p>
          </div>
          <div class="benefit-item">
            <h4>Secure</h4>
            <p>Your files are automatically deleted after processing</p>
          </div>
          <div class="benefit-item">
            <h4>Easy to Use</h4>
            <p>Simple interface for quick file conversions</p>
          </div>
          <div class="benefit-item">
            <h4>Free</h4>
            <p>Access basic tools without any cost</p>
          </div>
        </div>
      </section>

      <!-- Feedback Section -->
      <section class="feedback">
        <h2>FEEDBACK</h2>
        <p class="feedback-subtitle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
          vulputate libero et velit interdum, ac aliquet odio mattis.
        </p>
        <div class="feedback-carousel">
          <div class="feedback-track">
            <!-- Clone last items -->
            <div
              class="feedback-item clone"
              *ngFor="let feedback of lastClonedItems"
            >
              <div class="feedback-content">
                <img
                  [src]="feedback.avatar"
                  [alt]="feedback.name"
                  class="user-avatar"
                />
                <p>{{ feedback.text }}</p>
                <div class="user-info">
                  <span class="user-name">{{ feedback.name }}</span>
                  <span class="user-title">{{ feedback.title }}</span>
                </div>
              </div>
            </div>

            <!-- Original items -->
            <div class="feedback-item" *ngFor="let feedback of feedbacks">
              <div class="feedback-content">
                <img
                  [src]="feedback.avatar"
                  [alt]="feedback.name"
                  class="user-avatar"
                />
                <p>{{ feedback.text }}</p>
                <div class="user-info">
                  <span class="user-name">{{ feedback.name }}</span>
                  <span class="user-title">{{ feedback.title }}</span>
                </div>
              </div>
            </div>

            <!-- Clone first items -->
            <div
              class="feedback-item clone"
              *ngFor="let feedback of firstClonedItems"
            >
              <div class="feedback-content">
                <img
                  [src]="feedback.avatar"
                  [alt]="feedback.name"
                  class="user-avatar"
                />
                <p>{{ feedback.text }}</p>
                <div class="user-info">
                  <span class="user-name">{{ feedback.name }}</span>
                  <span class="user-title">{{ feedback.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Transform your first document in seconds</p>
        <a routerLink="features/pdf-tools/convert-from-pdf/pdf-to-word" class="cta-primary">Try Now</a>
      </section>
    </main>
  `,
  styleUrls: ['./landing-app.component.css'],
})
export class LandingAppComponent implements AfterViewInit {
  feedbacks = [
    {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      name: 'Mike Torello',
      title: 'Executive Engineer',
      avatar: 'assets/images/avatar1.png',
    },
    {
      text: 'Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
      name: 'Rick Wright',
      title: 'Executive Engineer',
      avatar: 'assets/images/avatar2.png',
    },
    {
      text: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra.',
      name: 'Devon Miles',
      title: 'Executive Engineer',
      avatar: 'assets/images/avatar3.png',
    },
    {
      text: 'Proin ac libero nec arcu vulputate consectetur.',
      name: 'Sarah Williams',
      title: 'Student',
      avatar: 'assets/images/avatar4.png',
    },
    {
      text: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      name: 'Bob Brown',
      title: 'Teacher',
      avatar: 'assets/images/avatar5.png',
    },
  ];

  get firstClonedItems() {
    return this.feedbacks.slice(0, 2);
  }

  get lastClonedItems() {
    return this.feedbacks.slice(-2);
  }

  isDragging = false;
  startX = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  currentIndex = 0;

  ngAfterViewInit() {
    const track = document.querySelector('.feedback-track') as HTMLElement;
    this.initializeSlider(track);

    track.addEventListener('mousedown', (e) => this.touchStart(e));
    track.addEventListener('touchstart', (e) => this.touchStart(e));
    track.addEventListener('mouseup', () => this.touchEnd());
    track.addEventListener('touchend', () => this.touchEnd());
    track.addEventListener('mousemove', (e) => this.touchMove(e));
    track.addEventListener('touchmove', (e) => this.touchMove(e));
    track.addEventListener('mouseleave', () => this.touchEnd());
  }

  private initializeSlider(track: HTMLElement) {
    // Set initial position to show first three items
    const itemWidth = track.clientWidth / 3;
    this.currentTranslate = -itemWidth * 2; // Skip cloned items
    this.prevTranslate = this.currentTranslate;
    this.setSliderPosition(track);
  }

  private touchStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.startX = this.getPositionX(event);
  }

  private touchMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.startX;
    this.currentTranslate = this.prevTranslate + diff;

    const track = document.querySelector('.feedback-track') as HTMLElement;
    this.setSliderPosition(track);
  }

  private touchEnd() {
    this.isDragging = false;
    const track = document.querySelector('.feedback-track') as HTMLElement;
    const itemWidth = track.clientWidth / 3;

    // Snap to nearest item
    const moveBy = this.currentTranslate - this.prevTranslate;
    if (Math.abs(moveBy) > itemWidth / 3) {
      if (moveBy < 0) {
        this.currentTranslate =
          Math.round(this.currentTranslate / itemWidth) * itemWidth;
      } else {
        this.currentTranslate =
          Math.round(this.currentTranslate / itemWidth) * itemWidth;
      }
    } else {
      this.currentTranslate = this.prevTranslate;
    }

    // Check for infinite scroll boundaries
    const totalWidth = itemWidth * this.feedbacks.length;
    if (Math.abs(this.currentTranslate) >= totalWidth) {
      this.currentTranslate = -itemWidth * 2;
    } else if (this.currentTranslate >= -itemWidth) {
      this.currentTranslate = -(totalWidth - itemWidth * 3);
    }

    this.prevTranslate = this.currentTranslate;
    this.setSliderPosition(track);
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent ? event.pageX : event.touches[0].clientX;
  }

  private setSliderPosition(track: HTMLElement) {
    track.style.transform = `translateX(${this.currentTranslate}px)`;
  }
}
