import { Component, OnInit, ElementRef, ViewChild, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    FooterComponent,
    TranslateModule
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('feedbackTrack', { static: true }) feedbackTrack!: ElementRef;
  
  // Feedback items for the feedback slider
  feedbacks = [
    {
      
      text: 'Tôi đã dùng công cụ này trong thiết kế, chuyển đổi hình ảnh nhanh với độ sắc nét cao, giúp tôi tiết kiệm được rất nhiều thời gian và công sức.',
      name: 'Lê Yến Nhi',
      title: 'Graphic Designer',
      avatar: 'assets/images/avatar1.png',
    },
    {
      text: 'Công cụ này giúp chuyển đổi báo cáo nhanh chóng, chính xác, giúp tiết kiệm thời gian và tăng hiệu suất công việc. ',
      name: 'Vũ Thị Thảo Trang',
      title: 'Business Analyst',
      avatar: 'assets/images/avatar2.png',
    },
    {
      text: 'Sự ổn định của công cụ giúp tôi chuyển đổi tốt mã nguồn và tài liệu, giữ nguyên cấu trúc và hỗ trợ tích hợp. ',
      name: 'Trần Ngọc Thắng',
      title: 'Web Developer',
      avatar: 'assets/images/avatar3.png',
    },
    {
      text: 'Nhờ các tính năng về xử lý dữ liệu số hay chuyển đổi các loại tài liệu, việc học của tôi trở nên dễ dàng hơn. Sẽ sớm chia sẻ công cụ tuyệt hảo này cho mọi người. ',
      name: 'Phạm Hải Đăng',
      title: 'University Student',
      avatar: 'assets/images/avatar4.png',
    },
    {
      text: 'Tôi đã dùng công cụ này cho văn phòng, chuyển đổi văn bản và hình ảnh nhanh, bảo mật dữ liệu an toàn, giúp quản lý công việc hiệu quả',
      name: 'Hồ Thanh Hiệp',
      title: 'Office Manager',
      avatar: 'assets/images/avatar5.png',
    }
  ];
  
  // Helper properties for the feedback slider
  get firstClonedItems() {
    return this.feedbacks.slice(0, 2);
  }
  
  get lastClonedItems() {
    return this.feedbacks.slice(-2);
  }

  // Slider properties
  currentSlide = 2; // Start at the first real slide (after clones)
  slideWidth = 0;
  totalSlides = 0;
  itemsPerView = 3;
  isGrabbing = false;
  startPosition = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  animationId = 0;
  autoplayInterval: any;

  // Animation flags
  toolsAnimated = false;
  reasonsAnimated = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Set timeout to ensure DOM is loaded
    setTimeout(() => {
      this.initSlider();
      this.setupAutoplay();
    }, 100);
  }

  ngAfterViewInit(): void {
    // Set up intersection observer for scroll animations
    this.setupScrollAnimations();
  }

  @HostListener('window:resize')
  onResize() {
    this.initSlider();
    this.goToSlide(this.currentSlide, false);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.checkScrollPosition();
  }

  setupScrollAnimations(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, options);

    // Add animation class to elements
    const toolItems = this.elementRef.nativeElement.querySelectorAll('.tool-item');
    const reasonCards = this.elementRef.nativeElement.querySelectorAll('.reason-card');

    toolItems.forEach((item: HTMLElement, index: number) => {
      item.classList.add('animate-on-scroll');
      item.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(item);
    });

    reasonCards.forEach((card: HTMLElement, index: number) => {
      card.classList.add('animate-on-scroll');
      card.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(card);
    });
  }

  checkScrollPosition(): void {
    const toolsSection = this.elementRef.nativeElement.querySelector('.tools-section');
    const reasonsSection = this.elementRef.nativeElement.querySelector('.why-choose-us');
    
    if (toolsSection && !this.toolsAnimated) {
      const toolsRect = toolsSection.getBoundingClientRect();
      if (toolsRect.top < window.innerHeight * 0.8) {
        this.toolsAnimated = true;
        this.animateTools();
      }
    }
    
    if (reasonsSection && !this.reasonsAnimated) {
      const reasonsRect = reasonsSection.getBoundingClientRect();
      if (reasonsRect.top < window.innerHeight * 0.8) {
        this.reasonsAnimated = true;
        this.animateReasons();
      }
    }
  }

  animateTools(): void {
    const toolItems = this.elementRef.nativeElement.querySelectorAll('.tool-item');
    toolItems.forEach((item: HTMLElement, index: number) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }

  animateReasons(): void {
    const reasonCards = this.elementRef.nativeElement.querySelectorAll('.reason-card');
    reasonCards.forEach((card: HTMLElement, index: number) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }

  initSlider(): void {
    const track = this.feedbackTrack.nativeElement;
    const viewportWidth = window.innerWidth;

    // Adjust items per view based on viewport width
    if (viewportWidth < 576) {
      this.itemsPerView = 1;
    } else if (viewportWidth < 992) {
      this.itemsPerView = 2;
    } else {
      this.itemsPerView = 3;
    }

    // Calculate slide width based on container width and items per view
    this.slideWidth = track.offsetWidth / this.itemsPerView;
    
    // Total number of slides (original + clones)
    this.totalSlides = this.feedbacks.length + this.firstClonedItems.length + this.lastClonedItems.length;

    // Position the slider at the first real slide
    this.goToSlide(this.currentSlide, false);
  }

  setupAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  resetAutoplay(): void {
    clearInterval(this.autoplayInterval);
    this.setupAutoplay();
  }

  prevSlide(): void {
    this.goToSlide(this.currentSlide - 1);
  }

  nextSlide(): void {
    this.goToSlide(this.currentSlide + 1);
  }

  goToSlide(slideIndex: number, animate = true): void {
    const track = this.feedbackTrack.nativeElement;
    
    // Set transition based on animate parameter
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    
    // Update current slide
    this.currentSlide = slideIndex;
    
    // Calculate the translate position
    const translateX = -this.slideWidth * this.currentSlide;
    this.prevTranslate = translateX;
    
    // Apply transform
    track.style.transform = `translateX(${translateX}px)`;
    
    // Handle infinite loop
    if (animate) {
      setTimeout(() => {
        // If we're at the end, jump to the beginning (hidden from user)
        if (slideIndex >= this.feedbacks.length + this.firstClonedItems.length) {
          this.goToSlide(this.firstClonedItems.length, false);
        }
        // If we're at the beginning, jump to the end (hidden from user)
        else if (slideIndex < this.firstClonedItems.length) {
          this.goToSlide(this.feedbacks.length + this.firstClonedItems.length - 1, false);
        }
      }, 500);
    }
    
    // Reset autoplay when manually changing slides
    if (animate) {
      this.resetAutoplay();
    }
  }

  // Touch/mouse events for drag functionality
  onMouseDown(event: MouseEvent): void {
    this.startDrag(event.clientX);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent): void => {
    this.drag(event.clientX);
  }

  onMouseUp = (): void => {
    this.endDrag();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.startDrag(event.touches[0].clientX);
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.drag(event.touches[0].clientX);
  }

  onTouchEnd(): void {
    this.endDrag();
  }

  startDrag(position: number): void {
    clearInterval(this.autoplayInterval);
    this.isGrabbing = true;
    this.startPosition = position;
    this.prevTranslate = this.currentTranslate;
    cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(this.animate);
    this.feedbackTrack.nativeElement.style.transition = 'none';
  }

  drag(position: number): void {
    if (this.isGrabbing) {
      const currentPosition = position;
      this.currentTranslate = this.prevTranslate + (currentPosition - this.startPosition);
    }
  }

  endDrag(): void {
    this.isGrabbing = false;
    cancelAnimationFrame(this.animationId);
    
    // Calculate how much the user dragged as a percentage of slide width
    const movePercent = (this.currentTranslate - this.prevTranslate) / this.slideWidth;
    
    // Determine which slide to go to based on drag distance
    if (movePercent < -0.2) {
      this.nextSlide();
    } else if (movePercent > 0.2) {
      this.prevSlide();
    } else {
      this.goToSlide(this.currentSlide);
    }
    
    this.setupAutoplay();
  }

  animate = (): void => {
    if (this.isGrabbing) {
      this.setSliderPosition();
      this.animationId = requestAnimationFrame(this.animate);
    }
  }

  setSliderPosition(): void {
    this.feedbackTrack.nativeElement.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  ngOnDestroy(): void {
    clearInterval(this.autoplayInterval);
  }
}
