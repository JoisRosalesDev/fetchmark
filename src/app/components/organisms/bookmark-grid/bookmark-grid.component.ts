import { Component, computed, input, output } from '@angular/core';
import { Bookmark, Folder } from '../../../core/models';
import { BookmarkCardComponent } from '../../molecules/bookmark-card/bookmark-card.component';
import { BookmarkSkeletonComponent } from '../../molecules/bookmark-skeleton/bookmark-skeleton.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-bookmark-grid',
  standalone: true,
  imports: [
    BookmarkCardComponent,
    BookmarkSkeletonComponent,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    @if (loading()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (item of skeletonArray; track $index) {
          <app-bookmark-skeleton />
        }
      </div>
    } @else if (bookmarks().length === 0) {
      <div
        class="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 my-6 shadow-xs"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 ring-1 ring-brand-500/20"
        >
          <app-icon name="bookmark" size="lg" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          No hay marcadores
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed font-medium">
          Aún no se han agregado marcadores en esta categoría. Comienza a guardar tus enlaces preferidos para acceder a ellos rápidamente.
        </p>
        <app-button variant="primary" size="md" (btnClick)="onCreateClick()">
          <app-icon name="plus" size="sm" class="mr-2" />
          Agregar marcador
        </app-button>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (item of bookmarks(); track item.id) {
          <app-bookmark-card
            [bookmark]="item"
            [folderName]="getFolderName(item.folderId)"
            (edit)="editBookmark.emit($event)"
            (delete)="deleteBookmark.emit($event)"
            (open)="openBookmark.emit($event)"
          />
        }
      </div>
    }
  `,
})
export class BookmarkGridComponent {
  bookmarks = input<Bookmark[]>([]);
  folders = input<Folder[]>([]);
  loading = input<boolean>(false);

  editBookmark = output<Bookmark>();
  deleteBookmark = output<string>();
  openBookmark = output<Bookmark>();
  createBookmark = output<void>();

  skeletonArray = Array.from({ length: 8 });

  private folderMap = computed(() => {
    const map = new Map<string, string>();
    for (const f of this.folders()) {
      map.set(f.id, f.name);
    }
    return map;
  });

  getFolderName(folderId?: string): string | undefined {
    if (!folderId) return undefined;
    return this.folderMap().get(folderId);
  }

  onCreateClick(): void {
    this.createBookmark.emit();
  }
}
