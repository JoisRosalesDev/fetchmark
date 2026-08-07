import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col surface-base selection:bg-brand-500 selection:text-white">
      <ng-content select="[navbar]" />

      <div class="flex-1 max-w-7xl w-full mx-auto flex gap-6 px-4 py-6">
        <aside
          class="hidden md:block w-64 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 h-[calc(100vh-6rem)] sticky top-20 overflow-hidden shadow-xs"
        >
          <ng-content select="[sidebar]" />
        </aside>

        <main class="flex-1 min-w-0">
          <ng-content select="[content]" />
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent {
  isMobileSidebarOpen = signal<boolean>(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }
}
