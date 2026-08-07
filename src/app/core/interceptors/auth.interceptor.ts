import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let modifiedReq = req;
  if (req.url.includes('/api/')) {
    modifiedReq = req.clone({
      withCredentials: true,
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/api/auth/me')) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
