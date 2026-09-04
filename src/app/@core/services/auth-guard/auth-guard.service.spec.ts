import { TestBed } from '@angular/core/testing';

import { IsChldrenAuthorizedGuard } from './auth-guard.service';

describe('AuthGuardService', () => {
  let service: IsChldrenAuthorizedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsChldrenAuthorizedGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
