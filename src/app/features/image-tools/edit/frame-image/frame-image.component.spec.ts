import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameImageComponent } from './frame-image.component';

describe('FrameImageComponent', () => {
  let component: FrameImageComponent;
  let fixture: ComponentFixture<FrameImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameImageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrameImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
