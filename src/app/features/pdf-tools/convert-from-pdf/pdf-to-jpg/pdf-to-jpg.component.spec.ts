import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToJpgComponent } from './pdf-to-jpg.component';

describe('PdfToJpgComponent', () => {
  let component: PdfToJpgComponent;
  let fixture: ComponentFixture<PdfToJpgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToJpgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfToJpgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
