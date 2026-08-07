import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
    title: 'FetchMark - Gestor Inteligente de Marcadores Web y YouTube',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
    title: 'Iniciar Sesión - FetchMark',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then(
        (m) => m.DashboardPageComponent
      ),
    canActivate: [authGuard],
    title: 'Panel de Control - FetchMark',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
