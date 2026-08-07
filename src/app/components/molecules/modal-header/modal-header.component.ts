import { Component, input, output } from '@angular/core';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-modal-header',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
      <div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {{ title() }}
        </h3>
        @if (subtitle()) {
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ subtitle() }}
          </p>
        }
      </div>
      <button
        type="button"
        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors state-focus"
        title="Cerrar modal"
        (click)="onClose()"
      >
        <app-icon name="x" size="md" />
      </button>
    </div>
  `,
})
export class ModalHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');

  close = output<void>();

  onClose() {
    this.close.emit();
  }
}
