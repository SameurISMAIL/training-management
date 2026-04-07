import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const expectedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
