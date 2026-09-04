import { TestBed } from '@angular/core/testing';

import { VisorImagenesService } from './visor-imagenes.service';

describe('VisorImagenesService', () => {
  let service: VisorImagenesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisorImagenesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
