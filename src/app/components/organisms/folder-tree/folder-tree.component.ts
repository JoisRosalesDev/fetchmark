import { Component, input, output } from '@angular/core';
import { Folder } from '../../../core/models';
import { FolderItemComponent } from '../../molecules/folder-item/folder-item.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [FolderItemComponent, IconComponent],
  template: `
    <div class="flex flex-col h-full bg-white">
      <div class="flex items-center justify-between px-3 py-2 mb-2">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Carpetas
        </h2>
        <button
          type="button"
          class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Crear carpeta"
          (click)="onCreateClick()"
        >
          <app-icon name="plus" size="sm" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-1 pr-1">
        <div
          [class]="allItemClasses()"
          (click)="onSelectAll()"
        >
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <app-icon
              name="bookmark"
              size="md"
              [class]="activeFolderId() === null ? 'text-indigo-600' : 'text-slate-400'"
            />
            <span class="truncate text-sm font-semibold tracking-tight">Todos los marcadores</span>
          </div>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {{ totalBookmarksCount() }}
          </span>
        </div>

        @for (folder of folders(); track folder.id) {
          <app-folder-item
            [folder]="folder"
            [isActive]="activeFolderId() === folder.id"
            [count]="getFolderBookmarkCount(folder.id)"
            [depth]="0"
            (select)="onSelectFolder($event)"
            (edit)="editFolder.emit($event)"
            (delete)="deleteFolder.emit($event)"
          />
        }
      </div>
    </div>
  `,
})
export class FolderTreeComponent {
  folders = input<Folder[]>([]);
  activeFolderId = input<string | null>(null);
  totalBookmarksCount = input<number>(0);
  bookmarkCountsByFolder = input<Record<string, number>>({});

  selectFolder = output<string | null>();
  createFolder = output<void>();
  editFolder = output<Folder>();
  deleteFolder = output<string>();

  allItemClasses(): string {
    const base =
      'group flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-150 cursor-pointer select-none state-focus';
    if (this.activeFolderId() === null) {
      return `${base} bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600 font-semibold shadow-xs`;
    }
    return `${base} border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium`;
  }

  getFolderBookmarkCount(folderId: string): number {
    return this.bookmarkCountsByFolder()[folderId] || 0;
  }

  onSelectAll(): void {
    this.selectFolder.emit(null);
  }

  onSelectFolder(folder: Folder): void {
    this.selectFolder.emit(folder.id);
  }

  onCreateClick(): void {
    this.createFolder.emit();
  }
}
