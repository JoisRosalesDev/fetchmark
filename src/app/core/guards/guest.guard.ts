import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.currentUser()) {
    return router.createUrlTree(['/dashboard']);
  }

  return authService.checkSession().pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
