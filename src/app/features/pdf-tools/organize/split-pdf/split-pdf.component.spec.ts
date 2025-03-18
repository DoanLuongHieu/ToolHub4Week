import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPdfComponent } from './split-pdf.component';

describe('SplitPdfComponent', () => {
  let component: SplitPdfComponent;
  let fixture: ComponentFixture<SplitPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitPdfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SplitPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
