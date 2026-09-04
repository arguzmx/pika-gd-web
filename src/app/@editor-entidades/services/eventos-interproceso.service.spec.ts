import { TestBed } from '@angular/core/testing';

import { EventosInterprocesoService } from './eventos-interproceso.service';

describe('EventosInterprocesoService', () => {
  let service: EventosInterprocesoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventosInterprocesoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
