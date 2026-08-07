import { Component, OnInit, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { FolderService } from '../../core/services/folder.service';
import { BookmarkService } from '../../core/services/bookmark.service';
import { Bookmark, Folder } from '../../core/models';
import { DashboardLayoutComponent } from '../../components/templates/dashboard-layout/dashboard-layout.component';
import { NavbarComponent } from '../../components/organisms/navbar/navbar.component';
import { FolderTreeComponent } from '../../components/organisms/folder-tree/folder-tree.component';
import { BookmarkGridComponent } from '../../components/organisms/bookmark-grid/bookmark-grid.component';
import { BookmarkFormModalComponent } from '../../components/organisms/bookmark-form-modal/bookmark-form-modal.component';
import { FolderFormModalComponent } from '../../components/organisms/folder-form-modal/folder-form-modal.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { IconComponent } from '../../components/atoms/icon/icon.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    DashboardLayoutComponent,
    NavbarComponent,
    FolderTreeComponent,
    BookmarkGridComponent,
    BookmarkFormModalComponent,
    FolderFormModalComponent,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    <app-dashboard-layout
      [isSidebarOpen]="isMobileSidebarOpen()"
      (closeSidebar)="isMobileSidebarOpen.set(false)"
    >
      <app-navbar
        navbar
        [user]="authService.currentUser()"
        [searchQuery]="bookmarkService.searchQuery()"
        (searchChange)="onSearchChange($event)"
        (logout)="onLogout()"
        (toggleSidebar)="isMobileSidebarOpen.update(v => !v)"
      />

      <app-folder-tree
        sidebar
        [folders]="folderService.folders()"
        [activeFolderId]="folderService.activeFolderId()"
        [totalBookmarksCount]="bookmarkService.bookmarks().length"
        [bookmarkCountsByFolder]="bookmarkCountsByFolder()"
        (selectFolder)="onSelectFolder($event)"
        (createFolder)="onOpenNewFolderModal()"
        (editFolder)="onEditFolder($event)"
        (deleteFolder)="onDeleteFolder($event)"
      />

      <div content class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-slate-100">
              {{ activeFolderName() }}
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ bookmarkService.bookmarks().length }} marcadores guardados
            </p>
          </div>

          <div class="flex items-center gap-2">
            <app-button
              variant="secondary"
              size="sm"
              (btnClick)="onOpenNewFolderModal()"
            >
              <app-icon name="folder-plus" size="sm" class="mr-1.5" />
              Nueva carpeta
            </app-button>
            <app-button
              variant="primary"
              size="sm"
              (btnClick)="onOpenNewBookmarkModal()"
            >
              <app-icon name="plus" size="sm" class="mr-1.5" />
              Nuevo marcador
            </app-button>
          </div>
        </div>

        <app-bookmark-grid
          [bookmarks]="bookmarkService.bookmarks()"
          [folders]="folderService.folders()"
          [loading]="bookmarkService.loading()"
          (editBookmark)="onEditBookmark($event)"
          (deleteBookmark)="onDeleteBookmark($event)"
          (openBookmark)="onOpenBookmark($event)"
          (createBookmark)="onOpenNewBookmarkModal()"
        />
      </div>
    </app-dashboard-layout>

    <app-bookmark-form-modal
      [isOpen]="isBookmarkModalOpen()"
      [bookmark]="editingBookmark()"
      [folders]="folderService.folders()"
      [selectedFolderId]="folderService.activeFolderId()"
      [loading]="isSavingBookmark()"
      (close)="isBookmarkModalOpen.set(false)"
      (save)="onSaveBookmark($event)"
    />

    <app-folder-form-modal
      [isOpen]="isFolderModalOpen()"
      [folder]="editingFolder()"
      [folders]="folderService.folders()"
      [parentIdInput]="folderService.activeFolderId()"
      [loading]="isSavingFolder()"
      (close)="isFolderModalOpen.set(false)"
      (save)="onSaveFolder($event)"
    />
  `,
})
export class DashboardPageComponent implements OnInit {
  authService = inject(AuthService);
  folderService = inject(FolderService);
  bookmarkService = inject(BookmarkService);
  private platformId = inject(PLATFORM_ID);

  isMobileSidebarOpen = signal<boolean>(false);

  isBookmarkModalOpen = signal<boolean>(false);
  editingBookmark = signal<Bookmark | null>(null);
  isSavingBookmark = signal<boolean>(false);

  isFolderModalOpen = signal<boolean>(false);
  editingFolder = signal<Folder | null>(null);
  isSavingFolder = signal<boolean>(false);

  bookmarkCountsByFolder = computed(() => {
    const counts: Record<string, number> = {};
    for (const b of this.bookmarkService.bookmarks()) {
      if (b.folderId) {
        counts[b.folderId] = (counts[b.folderId] || 0) + 1;
      }
    }
    return counts;
  });

  activeFolderName = computed(() => {
    const active = this.folderService.activeFolder();
    return active ? active.name : 'Todos los marcadores';
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.folderService.loadFolders().subscribe();
      this.loadCurrentBookmarks();
    }
  }

  loadCurrentBookmarks(): void {
    this.bookmarkService
      .loadBookmarks(
        this.folderService.activeFolderId(),
        this.bookmarkService.searchQuery()
      )
      .subscribe();
  }

  onSelectFolder(folderId: string | null): void {
    this.isMobileSidebarOpen.set(false);
    this.folderService.setActiveFolder(folderId);
    this.loadCurrentBookmarks();
  }

  onSearchChange(query: string): void {
    this.bookmarkService.setSearchQuery(query);
    this.loadCurrentBookmarks();
  }

  onLogout(): void {
    this.authService.logout().subscribe();
  }

  onOpenNewBookmarkModal(): void {
    this.editingBookmark.set(null);
    this.isBookmarkModalOpen.set(true);
  }

  onEditBookmark(bookmark: Bookmark): void {
    this.editingBookmark.set(bookmark);
    this.isBookmarkModalOpen.set(true);
  }

  onDeleteBookmark(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este marcador?')) {
      this.bookmarkService.deleteBookmark(id).subscribe();
    }
  }

  onOpenBookmark(bookmark: Bookmark): void {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  }

  onSaveBookmark(payload: {
    id?: string;
    title: string;
    url: string;
    description?: string;
    ogImage?: string;
    favicon?: string;
    folderId?: string | null;
  }): void {
    this.isSavingBookmark.set(true);
    const obs$ = payload.id
      ? this.bookmarkService.updateBookmark(payload.id, payload)
      : this.bookmarkService.createBookmark(payload as any);

    obs$.subscribe({
      next: () => {
        this.isSavingBookmark.set(false);
        this.isBookmarkModalOpen.set(false);
      },
      error: () => this.isSavingBookmark.set(false),
    });
  }

  onOpenNewFolderModal(): void {
    this.editingFolder.set(null);
    this.isFolderModalOpen.set(true);
  }

  onEditFolder(folder: Folder): void {
    this.editingFolder.set(folder);
    this.isFolderModalOpen.set(true);
  }

  onDeleteFolder(id: string): void {
    if (
      confirm(
        '¿Estás seguro de que deseas eliminar esta carpeta? Sus subcarpetas y marcadores no se borrarán pero perderán la asociación.'
      )
    ) {
      this.folderService.deleteFolder(id).subscribe();
    }
  }

  onSaveFolder(payload: {
    id?: string;
    name: string;
    parentId?: string | null;
  }): void {
    this.isSavingFolder.set(true);
    const obs$ = payload.id
      ? this.folderService.updateFolder(payload.id, payload)
      : this.folderService.createFolder(payload as any);

    obs$.subscribe({
      next: () => {
        this.isSavingFolder.set(false);
        this.isFolderModalOpen.set(false);
      },
      error: () => this.isSavingFolder.set(false),
    });
  }
}
