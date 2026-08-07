import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
    canActivate: [guestGuard],
    title: 'FetchMark - Guarda y Organiza tus Enlaces',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
    canActivate: [authGuard],
    title: 'Dashboard - FetchMark',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - FetchMark',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
