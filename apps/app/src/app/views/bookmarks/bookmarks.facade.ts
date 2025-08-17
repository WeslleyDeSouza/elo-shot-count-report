import { Injectable } from "@angular/core";
import { BookmarkService } from "@ui-lib/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize } from "rxjs";
import { Bookmark } from "./bookmarks.model";
import {
  BookmarkDto,
  CreateBookmarkDto,
  UpdateBookmarkDto,
  BookmarkPaginatedResponse,
  BookmarkListPaginated$Params,
} from "@ui-lib/apiClient";

@Injectable()
export class BookmarksFacade {
  private _loading = new BehaviorSubject<boolean>(false);
  private _bookmarks = new BehaviorSubject<Bookmark[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  // Public observables
  public readonly loading$ = this._loading.asObservable();
  public readonly bookmarks$ = this._bookmarks.asObservable();
  public readonly error$ = this._error.asObservable();

  constructor(protected service: BookmarkService) {}

  // Get all bookmarks for current tenant and user
  loadBookmarks(): Observable<Bookmark[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkList().pipe(
      map((bookmarks: BookmarkDto[]) => bookmarks.map(b => new Bookmark(b))),
      catchError(error => {
        this._error.next('Failed to load bookmarks');
        console.error('Error loading bookmarks:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Get paginated bookmarks
  loadBookmarksPaginated(options: Partial<BookmarkListPaginated$Params> = {}): Observable<BookmarkPaginatedResponse> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkListPaginated(options).pipe(
      map((response: BookmarkPaginatedResponse) => ({
        ...response,
        data: response.data.map(b => new Bookmark(b))
      })),
      catchError(error => {
        this._error.next('Failed to load paginated bookmarks');
        console.error('Error loading paginated bookmarks:', error);
        return of({
          data: [],
          total: 0,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: 0
        });
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Create new bookmark
  createBookmark(bookmark: CreateBookmarkDto): Observable<Bookmark | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkToggleBookmark({ body: bookmark }).pipe(
      map((createdBookmark: BookmarkDto) => {
        const newBookmark = new Bookmark(createdBookmark);
        // Update local state
        const currentBookmarks = this._bookmarks.value;
        this._bookmarks.next([newBookmark, ...currentBookmarks]);
        return newBookmark;
      }),
      catchError(error => {
        this._error.next('Failed to create bookmark');
        console.error('Error creating bookmark:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Update bookmark
  updateBookmark(bookmarkId: string, bookmark: UpdateBookmarkDto): Observable<Bookmark | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkUpdate({
      id: bookmarkId,
      body: bookmark
    }).pipe(
      map((updatedBookmark: BookmarkDto) => {
        const newBookmark = new Bookmark(updatedBookmark);
        // Update local state
        const currentBookmarks = this._bookmarks.value;
        const index = currentBookmarks.findIndex(b => b.bookmarkId === bookmarkId);
        if (index > -1) {
          currentBookmarks[index] = newBookmark;
          this._bookmarks.next([...currentBookmarks]);
        }
        return newBookmark;
      }),
      catchError(error => {
        this._error.next('Failed to update bookmark');
        console.error('Error updating bookmark:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Delete bookmark
  deleteBookmark(bookmarkId: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkDelete({ id: bookmarkId }).pipe(
      map(() => {
        // Update local state
        const currentBookmarks = this._bookmarks.value;
        const filteredBookmarks = currentBookmarks.filter(b => b.bookmarkId !== bookmarkId);
        this._bookmarks.next(filteredBookmarks);
        return true;
      }),
      catchError(error => {
        this._error.next('Failed to delete bookmark');
        console.error('Error deleting bookmark:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Get bookmark by ID
  getBookmarkById(bookmarkId: string): Observable<Bookmark | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.service.bookmarkFindOne({ id: bookmarkId }).pipe(
      map((bookmark: BookmarkDto) => new Bookmark(bookmark)),
      catchError(error => {
        this._error.next('Failed to load bookmark');
        console.error('Error loading bookmark:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  // Search bookmarks (client-side filtering for now)
  searchBookmarks(searchValue: string): Observable<Bookmark[]> {
    if (!searchValue.trim()) {
      return of([]);
    }

    const searchTerm = searchValue.toLowerCase();

    return this.bookmarks$.pipe(
      map(bookmarks =>
        bookmarks.filter(bookmark =>
          bookmark.title.toLowerCase().includes(searchTerm) ||
          bookmark.url.toLowerCase().includes(searchTerm) ||
          (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm)) ||
          (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
          (bookmark.category && bookmark.category.toLowerCase().includes(searchTerm))
        )
      )
    );
  }

  // Utility methods
  refreshBookmarks(): void {
    this.loadBookmarks().subscribe(bookmarks => {
      this._bookmarks.next(bookmarks);
    });
  }

  clearError(): void {
    this._error.next(null);
  }

  getCurrentBookmarks(): Bookmark[] {
    return this._bookmarks.value;
  }

  isLoading(): boolean {
    return this._loading.value;
  }

  // Filter bookmarks by category
  getBookmarksByCategory(category: string): Observable<Bookmark[]> {
    return this.bookmarks$.pipe(
      map(bookmarks =>
        bookmarks.filter(bookmark =>
          bookmark.category === category
        )
      )
    );
  }

  // Filter bookmarks by privacy
  getBookmarksByPrivacy(isPrivate: boolean): Observable<Bookmark[]> {
    return this.bookmarks$.pipe(
      map(bookmarks =>
        bookmarks.filter(bookmark =>
          bookmark.isPrivate === isPrivate
        )
      )
    );
  }

  // Get all unique categories
  getCategories(): Observable<string[]> {
    return this.bookmarks$.pipe(
      map(bookmarks => {
        const categories = bookmarks
          .map(bookmark => bookmark.category)
          .filter((category): category is string => !!category)
          .filter((category, index, array) => array.indexOf(category) === index);
        return categories.sort();
      })
    );
  }

  // Get all unique tags
  getTags(): Observable<string[]> {
    return this.bookmarks$.pipe(
      map(bookmarks => {
        const tags = bookmarks
          .flatMap(bookmark => bookmark.tags || [])
          .filter((tag, index, array) => array.indexOf(tag) === index);
        return tags.sort();
      })
    );
  }
}
