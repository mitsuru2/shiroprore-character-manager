import { TestBed } from '@angular/core/testing';

import { AppNavigateService } from './app-navigate.service';

describe('AppNavigateService', () => {
  let service: AppNavigateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppNavigateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
