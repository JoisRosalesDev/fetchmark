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
      'inline-flex items-center font-bold rounded-md ring-1 ring-inset select-none gap-1.5';

    let colorStyle = '';
    switch (this.color()) {
      case 'brand':
        colorStyle =
          'bg-indigo-100 text-indigo-800 ring-indigo-600/30 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-500/40';
        break;
      case 'gray':
        colorStyle =
          'bg-slate-200 text-slate-800 ring-slate-400/30 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700';
        break;
      case 'green':
        colorStyle =
          'bg-emerald-100 text-emerald-800 ring-emerald-600/30 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-500/40';
        break;
      case 'amber':
        colorStyle =
          'bg-amber-100 text-amber-900 ring-amber-600/30 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-500/40';
        break;
      case 'rose':
        colorStyle =
          'bg-rose-100 text-rose-800 ring-rose-600/30 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-500/40';
        break;
      case 'purple':
        colorStyle =
          'bg-purple-100 text-purple-800 ring-purple-600/30 dark:bg-purple-950 dark:text-purple-200 dark:ring-purple-500/40';
        break;
    }

    let sizeStyle = '';
    switch (this.size()) {
      case 'sm':
        sizeStyle = 'px-2 py-0.5 text-xs';
        break;
      case 'md':
        sizeStyle = 'px-2.5 py-1 text-xs font-bold';
        break;
    }

    return `${base} ${colorStyle} ${sizeStyle}`.trim();
  });

  dotClasses = computed(() => {
    const base = 'w-1.5 h-1.5 rounded-full';
    switch (this.color()) {
      case 'brand':
        return `${base} bg-indigo-600 dark:bg-indigo-400`;
      case 'gray':
        return `${base} bg-slate-600 dark:bg-slate-400`;
      case 'green':
        return `${base} bg-emerald-600 dark:bg-emerald-400`;
      case 'amber':
        return `${base} bg-amber-600 dark:bg-amber-400`;
      case 'rose':
        return `${base} bg-rose-600 dark:bg-rose-400`;
      case 'purple':
        return `${base} bg-purple-600 dark:bg-purple-400`;
    }
  });
}
