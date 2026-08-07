import { Component, computed, input, output, signal } from '@angular/core';
import { Bookmark } from '../../../core/models';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BookmarkActionsMenuComponent } from '../bookmark-actions-menu/bookmark-actions-menu.component';

@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  imports: [BadgeComponent, IconComponent, BookmarkActionsMenuComponent],
  template: `
    <div
      class="group relative flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 text-slate-900 break-inside-avoid"
    >
      <div class="relative w-full aspect-video overflow-hidden bg-slate-100 shrink-0 border-b border-slate-200">
        @if (bookmark().ogImage && !hasImageError()) {
          <img
            [src]="bookmark().ogImage"
            [alt]="bookmark().title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            (error)="onImageError()"
          />
        } @else {
          <div
            class="h-full w-full bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 flex flex-col items-center justify-center p-4 text-center"
          >
            <div
              class="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-indigo-600 mb-1.5 border border-slate-200"
            >
              @if (bookmark().favicon && !hasFaviconError()) {
                <img
                  [src]="bookmark().favicon"
                  alt=""
                  class="w-5 h-5 object-contain"
                  (error)="onFaviconError()"
                />
              } @else {
                <app-icon name="globe" size="lg" />
              }
            </div>
            <span class="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-indigo-600 border border-slate-200 truncate max-w-full">
              {{ domainName() }}
            </span>
          </div>
        }

        <div class="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-200">
          <app-bookmark-actions-menu
            [bookmarkId]="bookmark().id"
            (edit)="onMenuEdit()"
            (delete)="onMenuDelete()"
          />
        </div>
      </div>

      <div class="flex flex-col flex-1 p-4">
        <div class="flex items-center gap-2 mb-2">
          @if (bookmark().favicon && !hasFaviconError()) {
            <img
              [src]="bookmark().favicon"
              alt=""
              class="w-4 h-4 object-contain shrink-0 rounded-xs"
              (error)="onFaviconError()"
            />
          } @else {
            <app-icon name="globe" size="sm" class="text-slate-400 shrink-0" />
          }
          <span class="px-2 py-0.5 rounded-md bg-slate-100 text-indigo-600 border border-slate-200 text-[11px] font-bold truncate">
            {{ domainName() }}
          </span>
        </div>

        <a
          [href]="bookmark().url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-900 font-bold text-base hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-1.5"
          (click)="onOpen($event)"
        >
          {{ bookmark().title }}
        </a>

        @if (bookmark().description) {
          <p class="text-xs text-slate-500 line-clamp-2 mb-3.5 leading-relaxed font-normal">
            {{ bookmark().description }}
          </p>
        }

        <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          @if (folderName()) {
            <app-badge [text]="folderName()!" color="brand" size="sm" [dot]="true" />
          } @else {
            <app-badge text="Sin carpeta" color="gray" size="sm" />
          }

          <a
            [href]="bookmark().url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
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

  onMenuEdit() {
    this.edit.emit(this.bookmark());
  }

  onMenuDelete() {
    this.delete.emit(this.bookmark().id);
  }

  onOpen(event: MouseEvent) {
    this.open.emit(this.bookmark());
  }
}
