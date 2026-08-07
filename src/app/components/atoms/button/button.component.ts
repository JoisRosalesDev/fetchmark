import { Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <app-icon name="loader" size="sm" class="animate-spin mr-2" />
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  customClass = input<string>('', { alias: 'class' });

  btnClick = output<MouseEvent>();

  classes = computed(() => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 state-focus state-active state-disabled select-none cursor-pointer border border-transparent';

    let variantStyle = '';
    switch (this.variant()) {
      case 'primary':
        variantStyle =
          'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-700 shadow-sm shadow-brand-500/20 dark:bg-brand-500 dark:hover:bg-brand-600';
        break;
      case 'secondary':
        variantStyle =
          'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700';
        break;
      case 'danger':
        variantStyle =
          'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-700 shadow-sm shadow-rose-500/20 dark:bg-rose-500 dark:hover:bg-rose-600';
        break;
      case 'ghost':
        variantStyle =
          'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white';
        break;
    }

    let sizeStyle = '';
    switch (this.size()) {
      case 'sm':
        sizeStyle = 'px-3 py-1.5 text-xs rounded-lg min-h-[32px] gap-1.5';
        break;
      case 'md':
        sizeStyle = 'px-4 py-2 text-sm rounded-lg min-h-[40px] gap-2';
        break;
      case 'lg':
        sizeStyle = 'px-5 py-2.5 text-base rounded-xl min-h-[48px] gap-2.5';
        break;
    }

    const widthStyle = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variantStyle} ${sizeStyle} ${widthStyle} ${this.customClass()}`.trim();
  });

  onClick(event: MouseEvent) {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  }
}
