import { TestBed } from '@angular/core/testing';

import { CanalTareasService } from './canal-tareas.service';

describe('CanalTareasService', () => {
  let service: CanalTareasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanalTareasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
