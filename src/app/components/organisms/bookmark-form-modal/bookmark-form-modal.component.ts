import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bookmark, Folder } from '../../../core/models';
import { BookmarkService } from '../../../core/services/bookmark.service';
import { ModalHeaderComponent } from '../../molecules/modal-header/modal-header.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-bookmark-form-modal',
  standalone: true,
  imports: [
    FormsModule,
    ModalHeaderComponent,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="surface-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-slide-up p-6"
        >
          <app-modal-header
            [title]="isEditing() ? 'Editar Marcador' : 'Nuevo Marcador'"
            [subtitle]="
              isEditing()
                ? 'Modifica la información de tu enlace guardado'
                : 'Ingresa la URL para obtener metadatos automáticamente'
            "
            (close)="onClose()"
          />

          <form (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                URL del enlace <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  type="url"
                  [(ngModel)]="url"
                  name="url"
                  required
                  placeholder="https://ejemplo.com/articulo"
                  class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all pr-10"
                  (blur)="onUrlBlur()"
                />
                @if (bookmarkService.scraping()) {
                  <div class="absolute right-3 top-2.5 text-brand-600 dark:text-brand-400 animate-spin">
                    <app-icon name="loader" size="sm" />
                  </div>
                }
              </div>
              @if (scrapingSuccess()) {
                <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <app-icon name="check" size="sm" />
                  Metadatos extraídos automáticamente
                </p>
              }
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Título <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="title"
                name="title"
                required
                placeholder="Título descriptivo del marcador"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Descripción
              </label>
              <textarea
                [(ngModel)]="description"
                name="description"
                rows="3"
                placeholder="Breve descripción u observaciones"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Carpeta
              </label>
              <select
                [(ngModel)]="folderId"
                name="folderId"
                class="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
              >
                <option [value]="null">Sin carpeta</option>
                @for (folder of folders(); track folder.id) {
                  <option [value]="folder.id">{{ folder.name }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Imagen OG (URL)
                </label>
                <input
                  type="url"
                  [(ngModel)]="ogImage"
                  name="ogImage"
                  placeholder="https://..."
                  class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Favicon (URL)
                </label>
                <input
                  type="url"
                  [(ngModel)]="favicon"
                  name="favicon"
                  placeholder="https://..."
                  class="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
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
export class BookmarkFormModalComponent {
  bookmarkService = inject(BookmarkService);

  isOpen = input<boolean>(false);
  bookmark = input<Bookmark | null>(null);
  folders = input<Folder[]>([]);
  selectedFolderId = input<string | null>(null);
  loading = input<boolean>(false);

  close = output<void>();
  save = output<{
    id?: string;
    title: string;
    url: string;
    description?: string;
    ogImage?: string;
    favicon?: string;
    folderId?: string | null;
  }>();

  url = '';
  title = '';
  description = '';
  folderId: string | null = null;
  ogImage = '';
  favicon = '';

  isEditing = signal<boolean>(false);
  scrapingSuccess = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const bm = this.bookmark();
        if (bm) {
          this.isEditing.set(true);
          this.url = bm.url;
          this.title = bm.title;
          this.description = bm.description || '';
          this.folderId = bm.folderId || null;
          this.ogImage = bm.ogImage || '';
          this.favicon = bm.favicon || '';
        } else {
          this.isEditing.set(false);
          this.url = '';
          this.title = '';
          this.description = '';
          this.folderId = this.selectedFolderId();
          this.ogImage = '';
          this.favicon = '';
        }
        this.scrapingSuccess.set(false);
      }
    });
  }

  isValid(): boolean {
    return !!this.url.trim() && !!this.title.trim();
  }

  onUrlBlur(): void {
    const rawUrl = this.url.trim();
    if (!rawUrl || (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://'))) {
      return;
    }

    this.bookmarkService.scrapeUrl(rawUrl).subscribe({
      next: (meta) => {
        if (meta.title && !this.title) {
          this.title = meta.title;
        }
        if (meta.description && !this.description) {
          this.description = meta.description;
        }
        if (meta.ogImage && !this.ogImage) {
          this.ogImage = meta.ogImage;
        }
        if (meta.favicon && !this.favicon) {
          this.favicon = meta.favicon;
        }
        this.scrapingSuccess.set(true);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    const payload = {
      id: this.bookmark()?.id,
      title: this.title.trim(),
      url: this.url.trim(),
      description: this.description.trim() || undefined,
      ogImage: this.ogImage.trim() || undefined,
      favicon: this.favicon.trim() || undefined,
      folderId: this.folderId || null,
    };

    this.save.emit(payload);
  }
}
