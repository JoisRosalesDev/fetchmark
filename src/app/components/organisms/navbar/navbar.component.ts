import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    AvatarComponent,
    ButtonComponent,
    IconComponent,
    SearchBarComponent,
  ],
  template: `
    <header
      class="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs px-4 py-3"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            (click)="toggleSidebar.emit()"
            title="Abrir menú"
          >
            <app-icon name="folder" size="md" />
          </button>

          <div class="flex items-center gap-2.5 select-none">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500/20"
            >
              <app-icon name="bookmark" size="md" />
            </div>
            <span class="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              FetchMark
            </span>
          </div>
        </div>

        <div class="flex-1 max-w-md mx-4">
          <app-search-bar
            [value]="searchQuery()"
            placeholder="Buscar marcadores..."
            (search)="searchChange.emit($event)"
          />
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <app-button
            variant="primary"
            size="md"
            class="hidden sm:inline-flex"
            (btnClick)="newBookmark.emit()"
          >
            <app-icon name="plus" size="sm" class="mr-1.5" />
            Nuevo marcador
          </app-button>

          <app-button
            variant="primary"
            size="sm"
            class="sm:hidden"
            (btnClick)="newBookmark.emit()"
            title="Nuevo marcador"
          >
            <app-icon name="plus" size="sm" />
          </app-button>

          @if (user()) {
            <div class="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
              <app-avatar
                [src]="user()?.avatarUrl"
                [name]="user()?.name || user()?.email || 'Usuario'"
                size="md"
              />
              <span class="hidden lg:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
                {{ user()?.name || user()?.email }}
              </span>
              <button
                type="button"
                class="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                title="Cerrar sesión"
                (click)="logout.emit()"
              >
                <app-icon name="logout" size="sm" />
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  user = input<User | null>(null);
  searchQuery = input<string>('');

  searchChange = output<string>();
  newBookmark = output<void>();
  newFolder = output<void>();
  logout = output<void>();
  toggleSidebar = output<void>();
}
