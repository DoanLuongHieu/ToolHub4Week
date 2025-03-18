import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfToExcelComponent } from './pdf-to-excel.component';

describe('PdfToExcelComponent', () => {
  let component: PdfToExcelComponent;
  let fixture: ComponentFixture<PdfToExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToExcelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PdfToExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
