import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericalAnalysisComponent } from './numerical-analysis.component';

describe('NumericalAnalysisComponent', () => {
  let component: NumericalAnalysisComponent;
  let fixture: ComponentFixture<NumericalAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumericalAnalysisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NumericalAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
