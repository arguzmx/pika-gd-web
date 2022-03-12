import { TestBed } from '@angular/core/testing';

import { AppLogService } from './app-log.service';

describe('AppLogService', () => {
  let service: AppLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
