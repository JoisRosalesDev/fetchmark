import { Component } from '@angular/core';

@Component({
  selector: 'app-bookmark-skeleton',
  standalone: true,
  template: `
    <div
      class="surface-card rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-sm flex flex-col h-[320px] animate-pulse-subtle"
    >
      <div class="h-40 w-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>

      <div class="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <div class="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div class="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <div class="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700 mb-2"></div>
          <div class="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-3"></div>

          <div class="h-3 w-full rounded bg-slate-200 dark:bg-slate-700 mb-1.5"></div>
          <div class="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700"></div>
          <div class="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  `,
})
export class BookmarkSkeletonComponent {}
