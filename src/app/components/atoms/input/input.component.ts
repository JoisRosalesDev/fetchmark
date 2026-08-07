import { Component, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="w-full flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="id()" class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {{ label() }}
          @if (required()) {
            <span class="text-rose-500 ml-0.5">*</span>
          }
        </label>
      }
      <div class="relative flex items-center w-full">
        @if (icon()) {
          <div class="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            <app-icon [name]="icon()" size="md" />
          </div>
        }
        <input
          [id]="id()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [class]="inputClasses()"
          (input)="onInput($event)"
          (blur)="onBlur($event)"
        />
      </div>
      @if (error()) {
        <span class="text-xs text-rose-500 font-medium">{{ error() }}</span>
      }
    </div>
  `,
})
export class InputComponent {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  value = input<string>('');
  error = input<string>('');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  id = input<string>('');
  icon = input<string>('');

  valueChange = output<string>();
  blurEvent = output<FocusEvent>();

  get inputClasses(): () => string {
    return () => {
      const base =
        'w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border rounded-lg text-sm transition-all duration-150 shadow-sm state-focus state-disabled placeholder:text-slate-400';
      const padding = this.icon() ? 'pl-9 pr-3.5 py-2' : 'px-3.5 py-2';
      const border = this.error()
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
        : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-500/20';

      return `${base} ${padding} ${border}`.trim();
    };
  }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val);
  }

  onBlur(event: FocusEvent) {
    this.blurEvent.emit(event);
  }
}
