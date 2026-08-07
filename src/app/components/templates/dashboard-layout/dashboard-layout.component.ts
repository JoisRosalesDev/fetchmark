import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <div class="w-full">
        <ng-content select="[navbar]" />
      </div>

      <div class="flex flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 gap-6 relative">
        @if (isSidebarOpen()) {
          <div
            class="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden animate-fade-in"
            (click)="closeSidebar.emit()"
          ></div>
        }

        <aside
          class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 transition-transform duration-300 md:static md:z-auto md:w-64 md:shrink-0 md:bg-white md:border md:border-slate-200 md:rounded-2xl md:h-[calc(100vh-6rem)] md:sticky md:top-20 md:overflow-y-auto md:shadow-xs md:translate-x-0"
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
