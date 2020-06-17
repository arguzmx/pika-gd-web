import { TestBed } from '@angular/core/testing';

import { IsAuthorizedGuard } from './auth-guard.service';

describe('AuthGuardService', () => {
  let service: IsAuthorizedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsAuthorizedGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
