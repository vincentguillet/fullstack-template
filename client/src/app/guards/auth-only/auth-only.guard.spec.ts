import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { authOnlyGuard } from './auth-only.guard';

describe('authOnlyGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authOnlyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
