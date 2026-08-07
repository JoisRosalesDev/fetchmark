import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  template: `
    <div
      class="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-brand-500 selection:text-white"
    >
      <div class="w-full max-w-md">
        <ng-content />
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
