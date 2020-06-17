import { TestBed } from '@angular/core/testing';

import { PikaQueryBuilderService } from './pika-query-builder.service';

describe('PikaQueryBuilderService', () => {
  let service: PikaQueryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PikaQueryBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
