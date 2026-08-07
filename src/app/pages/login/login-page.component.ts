import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthLayoutComponent } from '../../components/templates/auth-layout/auth-layout.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, ButtonComponent, IconComponent],
  template: `
    <app-auth-layout>
      <div
        class="surface-card rounded-3xl p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 text-center animate-fade-in"
      >
        <div
          class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-brand-500/30"
        >
          <app-icon name="bookmark" size="lg" />
        </div>

        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Bienvenido a FetchMark
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          Tu gestor inteligente de marcadores. Organiza, descubre y accede a tus sitios web favoritos con extracción automática de metadatos.
        </p>

        <div class="space-y-3 mb-8 text-left bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <app-icon name="check" size="sm" class="text-emerald-500 shrink-0" />
            <span>Extracción automática de imágenes y descripciones OpenGraph</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <app-icon name="check" size="sm" class="text-emerald-500 shrink-0" />
            <span>Organización por carpetas jerárquicas</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <app-icon name="check" size="sm" class="text-emerald-500 shrink-0" />
            <span>Búsqueda rápida en tiempo real</span>
          </div>
        </div>

        <app-button
          variant="primary"
          size="lg"
          [fullWidth]="true"
          class="shadow-md hover:shadow-lg transition-shadow"
          (btnClick)="onGoogleLogin()"
        >
          <svg class="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          Iniciar sesión con Google
        </app-button>

        <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          Al iniciar sesión, aceptas los términos de servicio y políticas de privacidad de FetchMark.
        </p>
      </div>
    </app-auth-layout>
  `,
})
export class LoginPageComponent {
  private authService = inject(AuthService);

  onGoogleLogin(): void {
    this.authService.loginWithGoogle();
  }
}
