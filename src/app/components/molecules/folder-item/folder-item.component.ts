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
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <app-icon
          [name]="isActive() ? 'folder-plus' : 'folder'"
          size="md"
          [class]="iconClasses()"
        />
        <span class="truncate text-sm font-medium">{{ folder().name }}</span>
      </div>

      <div class="flex items-center gap-1 shrink-0 ml-2">
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
          {{ count() }}
        </span>

        <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            class="p-1 rounded text-slate-500 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Editar carpeta"
            (click)="onEdit($event)"
          >
            <app-icon name="edit" size="sm" />
          </button>
          <button
            type="button"
            class="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
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
      return `${base} bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/50 dark:text-brand-300 shadow-sm`;
    }

    return `${base} text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800/60`;
  });

  iconClasses = computed(() => {
    if (this.isActive()) {
      return 'text-brand-600 dark:text-brand-400';
    }
    return 'text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400';
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
