import { TestBed } from '@angular/core/testing';

import { PikaApiService } from './pika-api.service';

describe('PikaApiService', () => {
  let service: PikaApiService<any, string>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PikaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
