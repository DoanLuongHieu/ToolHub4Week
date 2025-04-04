import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ]
    });
    service = TestBed.inject(TranslationService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
