import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses()">
      @if (dot()) {
        <span [class]="dotClasses()"></span>
      }
      {{ text() }}
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  text = input<string>('');
  color = input<'brand' | 'gray' | 'green' | 'amber' | 'rose' | 'purple'>('brand');
  size = input<'sm' | 'md'>('sm');
  dot = input<boolean>(false);

  badgeClasses = computed(() => {
    const base =
      'inline-flex items-center font-medium rounded-md ring-1 ring-inset select-none gap-1.5';

    let colorStyle = '';
    switch (this.color()) {
      case 'brand':
        colorStyle =
          'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-500/30';
        break;
      case 'gray':
        colorStyle =
          'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700';
        break;
      case 'green':
        colorStyle =
          'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30';
        break;
      case 'amber':
        colorStyle =
          'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30';
        break;
      case 'rose':
        colorStyle =
          'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-500/30';
        break;
      case 'purple':
        colorStyle =
          'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-500/30';
        break;
    }

    let sizeStyle = '';
    switch (this.size()) {
      case 'sm':
        sizeStyle = 'px-2 py-0.5 text-xs';
        break;
      case 'md':
        sizeStyle = 'px-2.5 py-1 text-xs font-semibold';
        break;
    }

    return `${base} ${colorStyle} ${sizeStyle}`.trim();
  });

  dotClasses = computed(() => {
    const base = 'w-1.5 h-1.5 rounded-full';
    switch (this.color()) {
      case 'brand':
        return `${base} bg-indigo-500`;
      case 'gray':
        return `${base} bg-slate-500`;
      case 'green':
        return `${base} bg-emerald-500`;
      case 'amber':
        return `${base} bg-amber-500`;
      case 'rose':
        return `${base} bg-rose-500`;
      case 'purple':
        return `${base} bg-purple-500`;
    }
  });
}
