import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bookmark-actions-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        aria-label="Opciones del marcador"
        aria-haspopup="true"
        [attr.aria-expanded]="isOpen()"
        (click)="toggleMenu($event)"
        class="p-2 text-slate-500 hover:text-slate-700 active:bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </button>

      <div
        *ngIf="isOpen()"
        class="fixed inset-0 z-10 w-full h-full cursor-default"
        (click)="closeMenu()"
        (touchstart)="closeMenu()"
      ></div>

      <div
        *ngIf="isOpen()"
        class="absolute right-0 z-20 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 divide-y divide-slate-100 focus:outline-none transition-all duration-150 ease-out"
        role="menu"
        aria-orientation="vertical"
      >
        <div class="py-1" role="none">
          <button
            type="button"
            *ngIf="isOwner"
            (click)="onEdit($event)"
            class="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center gap-2.5 touch-manipulation cursor-pointer font-medium"
            role="menuitem"
          >
            <svg
              class="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </button>

          <button
            type="button"
            *ngIf="isOwner"
            (click)="onDelete($event)"
            class="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 active:bg-rose-100 flex items-center gap-2.5 touch-manipulation cursor-pointer font-medium"
            role="menuitem"
          >
            <svg
              class="w-4 h-4 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkActionsMenuComponent {
  @Input({ required: true }) bookmarkId!: string;
  @Input() isOwner: boolean = true;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  isOpen = signal<boolean>(false);

  toggleMenu(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.isOpen.update((prev) => !prev);
  }

  closeMenu(): void {
    this.isOpen.set(false);
  }

  onEdit(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.edit.emit(this.bookmarkId);
    this.closeMenu();
  }

  onDelete(event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    this.delete.emit(this.bookmarkId);
    this.closeMenu();
  }
}
