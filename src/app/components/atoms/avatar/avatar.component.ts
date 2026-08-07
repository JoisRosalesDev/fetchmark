import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div [class]="containerClasses()" [title]="name()">
      @if (src() && !hasError()) {
        <img
          [src]="src()"
          [alt]="name()"
          class="w-full h-full object-cover rounded-full"
          (error)="onImageError()"
        />
      } @else {
        <span class="font-bold text-slate-100 uppercase select-none">
          {{ initials() }}
        </span>
      }
    </div>
  `,
})
export class AvatarComponent {
  src = input<string | null | undefined>(null);
  name = input<string>('Usuario');
  size = input<'sm' | 'md' | 'lg'>('md');

  hasError = signal<boolean>(false);

  onImageError() {
    this.hasError.set(true);
  }

  initials = computed(() => {
    const raw = this.name().trim();
    if (!raw) return 'U';
    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.substring(0, 2).toUpperCase();
  });

  containerClasses = computed(() => {
    const base =
      'relative flex items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-xs';

    let sizeStyle = '';
    switch (this.size()) {
      case 'sm':
        sizeStyle = 'w-7 h-7 text-xs';
        break;
      case 'md':
        sizeStyle = 'w-9 h-9 text-sm';
        break;
      case 'lg':
        sizeStyle = 'w-11 h-11 text-base';
        break;
    }

    return `${base} ${sizeStyle}`.trim();
  });
}
