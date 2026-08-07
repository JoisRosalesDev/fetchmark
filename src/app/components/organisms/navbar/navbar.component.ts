import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    AvatarComponent,
    IconComponent,
    SearchBarComponent,
  ],
  template: `
    <header
      class="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3"
    >
      <div class="max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors cursor-pointer"
            (click)="toggleSidebar.emit()"
            title="Abrir menú"
          >
            <app-icon name="menu" size="md" />
          </button>

          <div class="flex items-center gap-2.5 select-none">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-brand-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20"
            >
              <app-icon name="bookmark" size="md" />
            </div>
            <span class="text-xl font-extrabold tracking-tight text-slate-900 hidden xs:inline-block">
              FetchMark
            </span>
          </div>
        </div>

        <div class="flex-1 max-w-md mx-2 sm:mx-4">
          <app-search-bar
            [value]="searchQuery()"
            placeholder="Buscar marcadores..."
            (search)="searchChange.emit($event)"
          />
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          @if (user()) {
            <div class="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <app-avatar
                [src]="user()?.avatarUrl"
                [name]="user()?.name || user()?.email || 'Usuario'"
                size="md"
              />
              <span class="hidden md:inline-block text-xs font-bold text-slate-700 max-w-[140px] truncate">
                {{ user()?.name || user()?.email }}
              </span>
              <button
                type="button"
                class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
  logout = output<void>();
  toggleSidebar = output<void>();
}
