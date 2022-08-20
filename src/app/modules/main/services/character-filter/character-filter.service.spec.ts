import { TestBed } from '@angular/core/testing';

import { CharacterFilterService } from './character-filter.service';

describe('CharacterFilterService', () => {
  let service: CharacterFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
