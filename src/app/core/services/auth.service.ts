import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  private checkSessionObservable: Observable<User | null> | null = null;

  checkSession(): Observable<User | null> {
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading.set(false);
      return of(null);
    }

    if (this.currentUser()) {
      this.isLoading.set(false);
      return of(this.currentUser());
    }

    if (this.checkSessionObservable) {
      return this.checkSessionObservable;
    }

    this.isLoading.set(true);
    this.checkSessionObservable = this.http
      .get<User>(`${environment.apiBaseUrl}/auth/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this.currentUser.set(user);
          this.isLoading.set(false);
          this.checkSessionObservable = null;
        }),
        catchError(() => {
          this.currentUser.set(null);
          this.isLoading.set(false);
          this.checkSessionObservable = null;
          return of(null);
        })
      );

    return this.checkSessionObservable;
  }

  loginWithGoogle(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `${environment.apiBaseUrl}/auth/google`;
    }
  }

  logout(): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(undefined);
    }

    return this.http
      .post<void>(
        `${environment.apiBaseUrl}/auth/logout`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.currentUser.set(null);
          this.router.navigate(['/login']);
        }),
        catchError(() => {
          this.currentUser.set(null);
          this.router.navigate(['/login']);
          return of(undefined);
        })
      );
  }
}
