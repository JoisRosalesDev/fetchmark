import {
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Folder } from '../../../core/models';
import { ModalHeaderComponent } from '../../molecules/modal-header/modal-header.component';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-folder-form-modal',
  standalone: true,
  imports: [FormsModule, ModalHeaderComponent, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-slide-up p-6 text-slate-900"
        >
          <app-modal-header
            [title]="isEditing() ? 'Editar Carpeta' : 'Nueva Carpeta'"
            [subtitle]="
              isEditing()
                ? 'Modifica el nombre y propiedades de la carpeta'
                : 'Organiza tus marcadores creando una nueva carpeta'
            "
            (close)="onClose()"
          />

          <form (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombre de la carpeta <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                placeholder="Ej. Recursos Web, Trabajo, Tutoriales"
                class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Carpeta Superior
              </label>
              <select
                [(ngModel)]="parentId"
                name="parentId"
                class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all shadow-xs"
              >
                <option [value]="null">Ninguna (Carpeta raíz)</option>
                @for (f of availableParentFolders(); track f.id) {
                  <option [value]="f.id">{{ f.name }}</option>
                }
              </select>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
              <app-button variant="ghost" size="md" (btnClick)="onClose()">
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                size="md"
                type="submit"
                [disabled]="!isValid() || loading()"
                [loading]="loading()"
              >
                {{ isEditing() ? 'Actualizar' : 'Guardar' }}
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class FolderFormModalComponent {
  isOpen = input<boolean>(false);
  folder = input<Folder | null>(null);
  folders = input<Folder[]>([]);
  parentIdInput = input<string | null>(null);
  loading = input<boolean>(false);

  close = output<void>();
  save = output<{
    id?: string;
    name: string;
    parentId?: string | null;
  }>();

  name = '';
  parentId: string | null = null;

  isEditing = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const f = this.folder();
        if (f) {
          this.isEditing.set(true);
          this.name = f.name;
          this.parentId = f.parentId || null;
        } else {
          this.isEditing.set(false);
          this.name = '';
          this.parentId = this.parentIdInput();
        }
      }
    });
  }

  availableParentFolders(): Folder[] {
    const currentId = this.folder()?.id;
    if (!currentId) return this.folders();
    return this.folders().filter((f) => f.id !== currentId);
  }

  isValid(): boolean {
    return !!this.name.trim();
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    const payload = {
      id: this.folder()?.id,
      name: this.name.trim(),
      parentId: this.parentId || null,
    };

    this.save.emit(payload);
  }
}
