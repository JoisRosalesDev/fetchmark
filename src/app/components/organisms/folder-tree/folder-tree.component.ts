import { Component, input, output } from '@angular/core';
import { Folder } from '../../../core/models';
import { FolderItemComponent } from '../../molecules/folder-item/folder-item.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-folder-tree',
  standalone: true,
  imports: [FolderItemComponent, ButtonComponent, IconComponent],
  template: `
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between px-3 py-2 mb-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Carpetas
        </h2>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <app-icon
              name="bookmark"
              size="md"
              [class]="activeFolderId() === null ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'"
            />
            <span class="truncate text-sm font-medium">Todos los marcadores</span>
          </div>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
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

      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
        <app-button
          variant="ghost"
          size="sm"
          [fullWidth]="true"
          class="justify-start text-slate-600 dark:text-slate-400"
          (btnClick)="onCreateClick()"
        >
          <app-icon name="plus" size="sm" class="mr-2 text-brand-600" />
          Nueva carpeta
        </app-button>
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
      return `${base} bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/50 dark:text-brand-300 shadow-sm`;
    }
    return `${base} text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60`;
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
