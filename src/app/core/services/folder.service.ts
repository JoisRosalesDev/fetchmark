import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Folder } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  readonly folders = signal<Folder[]>([]);
  readonly activeFolderId = signal<string | null>(null);
  readonly loading = signal<boolean>(false);

  readonly activeFolder = computed(() => {
    const id = this.activeFolderId();
    if (!id) return null;
    return this.folders().find((f) => f.id === id) || null;
  });

  loadFolders(): Observable<Folder[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    this.loading.set(true);
    return this.http.get<Folder[]>(`${environment.apiBaseUrl}/folders`).pipe(
      tap({
        next: (data) => {
          this.folders.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      })
    );
  }

  createFolder(payload: {
    name: string;
    color?: string;
    icon?: string;
    parentId?: string | null;
  }): Observable<Folder> {
    const body = {
      ...payload,
      parentId: payload.parentId || undefined,
    };
    return this.http
      .post<Folder>(`${environment.apiBaseUrl}/folders`, body)
      .pipe(
        tap(() => {
          this.loadFolders().subscribe();
        })
      );
  }

  updateFolder(
    id: string,
    payload: {
      name?: string;
      color?: string;
      icon?: string;
      parentId?: string | null;
    }
  ): Observable<Folder> {
    const body = {
      ...payload,
      parentId: payload.parentId || undefined,
    };
    return this.http
      .put<Folder>(`${environment.apiBaseUrl}/folders/${id}`, body)
      .pipe(
        tap(() => {
          this.loadFolders().subscribe();
        })
      );
  }

  deleteFolder(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiBaseUrl}/folders/${id}`)
      .pipe(
        tap(() => {
          if (this.activeFolderId() === id) {
            this.activeFolderId.set(null);
          }
          this.loadFolders().subscribe();
        })
      );
  }

  setActiveFolder(id: string | null): void {
    this.activeFolderId.set(id);
  }
}
