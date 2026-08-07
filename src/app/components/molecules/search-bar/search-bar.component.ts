import { Component, EffectRef, OnDestroy, effect, input, output, signal } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="relative w-full sm:w-72 md:w-96 flex items-center">
      <div class="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
        <app-icon name="search" size="md" />
      </div>
      <input
        type="text"
        [value]="query()"
        [placeholder]="placeholder()"
        class="w-full bg-slate-100 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all duration-150 state-focus placeholder:text-slate-400 font-medium focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
        (input)="onInput($event)"
      />
      @if (query().length > 0) {
        <button
          type="button"
          class="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md state-focus transition-colors cursor-pointer"
          title="Limpiar búsqueda"
          (click)="clearSearch()"
        >
          <app-icon name="x" size="sm" />
        </button>
      }
    </div>
  `,
})
export class SearchBarComponent implements OnDestroy {
  placeholder = input<string>('Buscar marcadores por título, descripción o URL...');
  value = input<string>('');

  search = output<string>();

  query = signal<string>('');
  private timer: ReturnType<typeof setTimeout> | null = null;
  private effectRef: EffectRef;

  constructor() {
    this.effectRef = effect(() => {
      this.query.set(this.value());
    });
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.query.set(val);

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.search.emit(val);
    }, 250);
  }

  clearSearch() {
    this.query.set('');
    if (this.timer) clearTimeout(this.timer);
    this.search.emit('');
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }
}
