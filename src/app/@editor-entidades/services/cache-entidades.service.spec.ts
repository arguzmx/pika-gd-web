import { TestBed } from '@angular/core/testing';

import { CacheEntidadesService } from './cache-entidades.service';

describe('CacheEntidadesService', () => {
  let service: CacheEntidadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheEntidadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
