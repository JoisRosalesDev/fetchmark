import { Component, computed, input, output } from '@angular/core';
import { Folder } from '../../../core/models';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-folder-item',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div
      [class]="itemClasses()"
      [style.paddingLeft.px]="indentPadding()"
      (click)="onSelect($event)"
    >
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <app-icon
          [name]="isActive() ? 'folder-plus' : 'folder'"
          size="md"
          [class]="iconClasses()"
        />
        <span class="truncate text-sm font-semibold tracking-tight">{{ folder().name }}</span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {{ count() }}
        </span>

        <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            class="p-1 rounded-md text-slate-500 hover:text-brand-600 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors"
            title="Editar carpeta"
            (click)="onEdit($event)"
          >
            <app-icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            class="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
            title="Eliminar carpeta"
            (click)="onDelete($event)"
          >
            <app-icon name="trash" size="sm" />
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FolderItemComponent {
  folder = input.required<Folder>();
  isActive = input<boolean>(false);
  count = input<number>(0);
  depth = input<number>(0);

  select = output<Folder>();
  edit = output<Folder>();
  delete = output<string>();

  indentPadding = computed(() => {
    return this.depth() * 16 + 12;
  });

  itemClasses = computed(() => {
    const base =
      'group flex items-center justify-between py-2 pr-3 rounded-xl transition-all duration-150 cursor-pointer select-none state-focus';

    if (this.isActive()) {
      return `${base} border-l-4 border-brand-600 dark:border-brand-500 bg-brand-50/90 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100 font-bold shadow-xs`;
    }

    return `${base} border-l-4 border-transparent text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white`;
  });

  iconClasses = computed(() => {
    if (this.isActive()) {
      return 'text-brand-600 dark:text-brand-400';
    }
    return 'text-slate-500 group-hover:text-brand-600 dark:text-slate-400 dark:group-hover:text-brand-400';
  });

  onSelect(event: MouseEvent) {
    this.select.emit(this.folder());
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.edit.emit(this.folder());
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit(this.folder().id);
  }
}
