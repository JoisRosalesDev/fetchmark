import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthLayoutComponent } from '../../components/templates/auth-layout/auth-layout.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [AuthLayoutComponent, IconComponent],
  template: `
    <app-auth-layout>
      <div
        class="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 text-center animate-fade-in"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-brand-500/35 ring-4 ring-brand-500/10"
        >
          <app-icon name="bookmark" size="lg" />
        </div>

        <h1 class="text-3xl font-extrabold text-white tracking-tight mb-2">
          Bienvenido a FetchMark
        </h1>
        <p class="text-sm text-slate-300 mb-8 leading-relaxed font-medium">
          Tu gestor inteligente de marcadores. Organiza, descubre y accede a tus sitios web favoritos con extracción automática de metadatos.
        </p>

        <div class="space-y-3 mb-8 text-left bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shadow-xs">
          <div class="flex items-center gap-3 text-xs font-semibold text-slate-200">
            <app-icon name="check" size="sm" class="text-emerald-400 shrink-0" />
            <span>Extracción automática de imágenes y descripciones OpenGraph</span>
          </div>
          <div class="flex items-center gap-3 text-xs font-semibold text-slate-200">
            <app-icon name="check" size="sm" class="text-emerald-400 shrink-0" />
            <span>Organización por carpetas jerárquicas</span>
          </div>
          <div class="flex items-center gap-3 text-xs font-semibold text-slate-200">
            <app-icon name="check" size="sm" class="text-emerald-400 shrink-0" />
            <span>Búsqueda rápida en tiempo real</span>
          </div>
        </div>

        <button
          type="button"
          class="w-full bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-sm focus:ring-4 focus:ring-brand-500/20 cursor-pointer"
          (click)="onGoogleLogin()"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span>Iniciar sesión con Google</span>
        </button>

        <p class="text-[11px] text-slate-400 mt-6 font-medium">
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
