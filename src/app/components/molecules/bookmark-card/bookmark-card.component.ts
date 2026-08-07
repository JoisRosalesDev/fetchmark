import { Component, computed, input, output, signal } from '@angular/core';
import { Bookmark } from '../../../core/models';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  imports: [BadgeComponent, IconComponent],
  template: `
    <div
      class="group relative flex flex-col h-full surface-card rounded-xl overflow-hidden shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:ring-1 hover:ring-black/5 dark:hover:ring-white/10 break-inside-avoid"
    >
      <div class="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
        @if (bookmark().ogImage && !hasImageError()) {
          <img
            [src]="bookmark().ogImage"
            [alt]="bookmark().title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            (error)="onImageError()"
          />
        } @else {
          <div
            class="h-full w-full bg-gradient-to-br from-brand-500/15 via-indigo-500/5 to-slate-200/50 dark:to-slate-800/50 flex flex-col items-center justify-center p-4 text-center"
          >
            <div
              class="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-brand-600 mb-2"
            >
              @if (bookmark().favicon && !hasFaviconError()) {
                <img
                  [src]="bookmark().favicon"
                  alt=""
                  class="w-6 h-6 object-contain"
                  (error)="onFaviconError()"
                />
              } @else {
                <app-icon name="globe" size="lg" />
              }
            </div>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-full px-2">
              {{ domainName() }}
            </span>
          </div>
        }

        <div
          class="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10"
        >
          <button
            type="button"
            class="p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600 shadow-sm backdrop-blur-sm transition-colors"
            title="Editar marcador"
            (click)="onEdit($event)"
          >
            <app-icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 shadow-sm backdrop-blur-sm transition-colors"
            title="Eliminar marcador"
            (click)="onDelete($event)"
          >
            <app-icon name="trash" size="sm" />
          </button>
        </div>
      </div>

      <div class="flex flex-col flex-1 p-4">
        <div class="flex items-center gap-2 mb-2">
          @if (bookmark().favicon && !hasFaviconError()) {
            <img
              [src]="bookmark().favicon"
              alt=""
              class="w-4 h-4 object-contain shrink-0"
              (error)="onFaviconError()"
            />
          } @else {
            <app-icon name="globe" size="sm" class="text-slate-400 shrink-0" />
          }
          <span class="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
            {{ domainName() }}
          </span>
        </div>

        <a
          [href]="bookmark().url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-900 dark:text-slate-100 font-semibold text-sm hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2 leading-snug mb-1.5"
          (click)="onOpen($event)"
        >
          {{ bookmark().title }}
        </a>

        @if (bookmark().description) {
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {{ bookmark().description }}
          </p>
        }

        <div class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          @if (folderName()) {
            <app-badge [text]="folderName()!" color="brand" size="sm" [dot]="true" />
          } @else {
            <app-badge text="Sin carpeta" color="gray" size="sm" />
          }

          <a
            [href]="bookmark().url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            title="Abrir enlace externo"
          >
            Abrir enlace
            <app-icon name="external-link" size="sm" />
          </a>
        </div>
      </div>
    </div>
  `,
})
export class BookmarkCardComponent {
  bookmark = input.required<Bookmark>();
  folderName = input<string | undefined>(undefined);

  edit = output<Bookmark>();
  delete = output<string>();
  open = output<Bookmark>();

  hasImageError = signal<boolean>(false);
  hasFaviconError = signal<boolean>(false);

  onImageError() {
    this.hasImageError.set(true);
  }

  onFaviconError() {
    this.hasFaviconError.set(true);
  }

  domainName = computed(() => {
    try {
      const parsed = new URL(this.bookmark().url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return this.bookmark().url;
    }
  });

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.edit.emit(this.bookmark());
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.delete.emit(this.bookmark().id);
  }

  onOpen(event: MouseEvent) {
    this.open.emit(this.bookmark());
  }
}
