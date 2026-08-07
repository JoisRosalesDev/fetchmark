import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../components/atoms/icon/icon.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-indigo-100/60 shadow-xs px-4 sm:px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <app-icon name="bookmark" size="md" />
            </div>
            <span class="text-xl font-extrabold tracking-tight text-slate-900">
              FetchMark
            </span>
          </div>

          <button
            type="button"
            (click)="onGoogleLogin()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all text-sm flex items-center gap-2 cursor-pointer"
          >
            Iniciar Sesión
            <app-icon name="arrow-right" size="sm" />
          </button>
        </div>
      </header>

      <main class="flex-1">
        <section class="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 text-center max-w-6xl mx-auto bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 rounded-3xl my-4 border border-indigo-100/50 shadow-xs overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 via-transparent to-transparent pointer-events-none"></div>

          <div class="relative z-10 max-w-4xl mx-auto">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-6 animate-fade-in shadow-xs">
              <span class="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <app-icon name="star" size="sm" class="text-indigo-600" />
              Novedad: Soporte dedicado para YouTube oEmbed
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 animate-slide-up">
              Guarda, organiza y accede a tus marcadores con
              <span class="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                potencia inteligente
              </span>
            </h1>

            <p class="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium animate-slide-up delay-100">
              La plataforma moderna para gestionar tus enlaces con scraping automático de metadatos OpenGraph, captura de YouTube y organización por carpetas.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-100">
              <button
                type="button"
                (click)="onGoogleLogin()"
                class="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Comenzar gratis
                <app-icon name="arrow-right" size="md" />
              </button>
            </div>

            <div class="bg-white/90 backdrop-blur-md border border-indigo-100 shadow-2xl shadow-indigo-500/10 rounded-2xl p-6 sm:p-8 animate-slide-up delay-200 text-left max-w-4xl mx-auto">
              <div class="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span class="ml-2 text-xs font-semibold text-slate-400">FetchMark Dashboard</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">128 Marcadores</span>
                  <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">8 Carpetas</span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all">
                  <div class="relative aspect-video rounded-lg overflow-hidden bg-slate-950 mb-3 group">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" alt="Vista previa de diseño 3D" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <span class="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-semibold">Diseño 3D</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h4 class="text-sm font-bold text-slate-900 truncate">Tendencias de Animación Web 2026</h4>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-2">Explora los últimos patrones de motion graphics y microinteracciones para experiencias digitales.</p>
                </div>

                <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all">
                  <div class="relative aspect-video rounded-lg overflow-hidden bg-slate-900 mb-3 group">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" alt="Video de YouTube" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-75" />
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                        <app-icon name="video" size="sm" />
                      </div>
                    </div>
                    <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold">YouTube oEmbed</div>
                  </div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <h4 class="text-sm font-bold text-slate-900 truncate">Guía Completa de Angular 22 & Signals</h4>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-2">Aprende a construir aplicaciones ultrarrápidas con la nueva arquitectura reactiva de Angular.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 relative">
          <div class="max-w-7xl mx-auto">
            <div class="text-center max-w-2xl mx-auto mb-16">
              <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Diseñado para simplificar tu flujo web
              </h2>
              <p class="text-base text-slate-600 leading-relaxed">
                Todo lo que necesitas para mantener tus recursos web organizados y accesibles desde cualquier lugar.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-indigo-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start relative group">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20 animate-float">
                  <app-icon name="zap" size="lg" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  Scraping Inteligente
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Extrae automáticamente títulos, descripciones e imágenes OpenGraph con solo ingresar la URL de cualquier sitio web.
                </p>
              </div>

              <div class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-indigo-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start relative group">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 animate-float delay-200">
                  <app-icon name="video" size="lg" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  Integración YouTube oEmbed
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Captura miniaturas en alta resolución y nombres de canales para tus videos favoritos de forma instantánea.
                </p>
              </div>

              <div class="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-indigo-100/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-start relative group">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20 animate-float delay-400">
                  <app-icon name="smartphone" size="lg" />
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  Interfaz Mobile-First
                </h3>
                <p class="text-sm text-slate-600 leading-relaxed">
                  Acciones contextuales táctiles mediante menú Kebab continuo, accesible desde smartphones sin requerir cursor suspendido.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-indigo-600/30 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div class="absolute -left-10 -top-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div class="relative z-10 max-w-3xl mx-auto">
              <h2 class="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                ¿Listo para organizar tu biblioteca digital?
              </h2>
              <p class="text-indigo-100 text-base sm:text-lg mb-8 max-w-xl mx-auto font-medium leading-relaxed">
                Empieza a utilizar FetchMark hoy mismo y mantén tus enlaces esenciales al alcance de un clic.
              </p>
              <button
                type="button"
                (click)="onGoogleLogin()"
                class="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg cursor-pointer"
              >
                Comenzar con Google
                <app-icon name="arrow-right" size="md" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer class="bg-white border-t border-slate-200/80 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              F
            </div>
            <span class="font-bold text-slate-700">FetchMark</span>
          </div>
          <p>© 2026 FetchMark. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
})
export class LandingPageComponent {
  private authService = inject(AuthService);

  onGoogleLogin(): void {
    this.authService.loginWithGoogle();
  }
}
