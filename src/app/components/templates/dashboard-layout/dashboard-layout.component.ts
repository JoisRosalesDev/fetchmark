import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      <ng-content select="[navbar]" />

      <div class="flex-1 max-w-7xl w-full mx-auto flex gap-6 px-4 py-6 relative">
        @if (isSidebarOpen()) {
          <div
            class="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in"
            (click)="closeSidebar.emit()"
          ></div>
        }

        <aside
          class="fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 p-4 transform transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:bg-slate-900/90 lg:border lg:rounded-2xl lg:h-[calc(100vh-6rem)] lg:sticky lg:top-20 lg:overflow-hidden lg:shadow-xl lg:backdrop-blur-md"
          [class.-translate-x-full]="!isSidebarOpen()"
          [class.translate-x-0]="isSidebarOpen()"
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
  isSidebarOpen = input<boolean>(false);
  closeSidebar = output<void>();
}
