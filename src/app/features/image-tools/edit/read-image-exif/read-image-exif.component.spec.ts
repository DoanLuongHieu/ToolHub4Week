import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadImageExifComponent } from './read-image-exif.component';

describe('ReadImageExifComponent', () => {
  let component: ReadImageExifComponent;
  let fixture: ComponentFixture<ReadImageExifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadImageExifComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadImageExifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
