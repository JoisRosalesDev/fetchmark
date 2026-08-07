import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Bookmark, ScrapedMetadata } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  readonly bookmarks = signal<Bookmark[]>([]);
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly scraping = signal<boolean>(false);

  loadBookmarks(
    folderId?: string | null,
    query?: string
  ): Observable<Bookmark[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    this.loading.set(true);
    let params = new HttpParams();

    if (folderId) {
      params = params.set('folderId', folderId);
    }
    if (query && query.trim()) {
      params = params.set('query', query.trim());
    }

    return this.http
      .get<Bookmark[]>(`${environment.apiBaseUrl}/bookmarks`, { params })
      .pipe(
        tap({
          next: (data) => {
            this.bookmarks.set(data);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        })
      );
  }

  createBookmark(payload: {
    title: string;
    url: string;
    description?: string;
    ogImage?: string;
    favicon?: string;
    folderId?: string | null;
  }): Observable<Bookmark> {
    const body = {
      ...payload,
      folderId: payload.folderId || undefined,
    };
    return this.http
      .post<Bookmark>(`${environment.apiBaseUrl}/bookmarks`, body)
      .pipe(
        tap(() => {
          this.loadBookmarks(null, this.searchQuery()).subscribe();
        })
      );
  }

  updateBookmark(
    id: string,
    payload: {
      title?: string;
      url?: string;
      description?: string;
      ogImage?: string;
      favicon?: string;
      folderId?: string | null;
    }
  ): Observable<Bookmark> {
    const body = {
      ...payload,
      folderId: payload.folderId || undefined,
    };
    return this.http
      .put<Bookmark>(`${environment.apiBaseUrl}/bookmarks/${id}`, body)
      .pipe(
        tap(() => {
          this.loadBookmarks(null, this.searchQuery()).subscribe();
        })
      );
  }

  deleteBookmark(id: string): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiBaseUrl}/bookmarks/${id}`)
      .pipe(
        tap(() => {
          this.loadBookmarks(null, this.searchQuery()).subscribe();
        })
      );
  }

  scrapeUrl(url: string): Observable<ScrapedMetadata> {
    this.scraping.set(true);
    return this.http
      .post<ScrapedMetadata>(`${environment.apiBaseUrl}/bookmarks/scrape`, {
        url,
      })
      .pipe(
        tap({
          next: () => this.scraping.set(false),
          error: () => this.scraping.set(false),
        })
      );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
}
