import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookmarksFacade } from '../bookmarks.facade';
import { Bookmark } from '../bookmarks.model';
import { BookmarkListPaginated$Params } from '@ui-lib/apiClient';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { BookmarksListComponent } from './bookmarks-list.component';

@Component({
  selector: 'app-bookmarks',
  imports: [CommonModule, FormsModule, BookmarksListComponent],
  templateUrl: './bookmarks.component.html',
  styles: ``
})
export class BookmarksComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(BookmarksFacade);
  private router = inject(Router);

  // Signals
  allBookmarks = signal<Bookmark[]>([]);
  sortBy = signal('');
  searchText = signal('');
  filterBy = signal('all');
  categoryFilter = signal('');
  privacyFilter = signal('all');
  loading = signal(false);
  error = signal<string | null>(null);

  // Configuration
  title = "Bookmarks";
  subTitle = "Saved Links";

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);

  // Available categories and tags
  categories = signal<string[]>([]);
  tags = signal<string[]>([]);

  bookmarks = computed(() => {
    let filteredBookmarks = this.allBookmarks();

    // Apply search filter
    if (this.searchText()) {
      const searchTerm = this.searchText().toLowerCase();
      filteredBookmarks = filteredBookmarks.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.url.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (this.categoryFilter() && this.categoryFilter() !== '') {
      filteredBookmarks = filteredBookmarks.filter(item => item.category === this.categoryFilter());
    }

    // Apply privacy filter
    if (this.privacyFilter() && this.privacyFilter() !== 'all') {
      if (this.privacyFilter() === 'private') {
        filteredBookmarks = filteredBookmarks.filter(item => item.isPrivate);
      } else if (this.privacyFilter() === 'public') {
        filteredBookmarks = filteredBookmarks.filter(item => item.isPublic);
      }
    }

    // Apply sorting
    if (this.sortBy()) {
      filteredBookmarks = this.sortData(filteredBookmarks, this.sortBy());
    }

    return filteredBookmarks;
  });

  sortData(data: Bookmark[], sortBy: string): Bookmark[] {
    return data.sort((a, b) => {
      let aValue = (a as any)[sortBy];
      let bValue = (b as any)[sortBy];

      // Handle dates
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) {
        return -1;
      } else if (aValue > bValue) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onSortChange(event: any): void {
    this.sortBy.set(event.target.value);
    this.loadBookmarks();
  }

  searchName(event: any): void {
    this.searchText.set(event.target.value);
    this.currentPage.set(1); // Reset to first page when searching
    this.loadBookmarks();
  }

  onCategoryFilterChange(event: any): void {
    this.categoryFilter.set(event.target.value);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadBookmarks();
  }

  onPrivacyFilterChange(event: any): void {
    this.privacyFilter.set(event.target.value);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadBookmarks();
  }

  // Statistics computed signals
  totalBookmarks = computed(() => this.totalItems());

  privateBookmarks = computed(() =>
    this.allBookmarks().filter(bookmark => bookmark.isPrivate).length
  );

  publicBookmarks = computed(() =>
    this.allBookmarks().filter(bookmark => bookmark.isPublic).length
  );

  categorizedBookmarks = computed(() =>
    this.allBookmarks().filter(bookmark => bookmark.hasCategory).length
  );

  onRowsChange(event: any): void {
    const newLimit = parseInt(event.target.value);
    this.itemsPerPage.set(newLimit);
    this.currentPage.set(1); // Reset to first page
    this.loadBookmarks();
  }

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
    this.loadBookmarks();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFacadeSubscriptions(): void {
    // Subscribe to loading state
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    // Subscribe to error state
    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  protected loadBookmarks(): void {
    const options: BookmarkListPaginated$Params = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      // Note: API might not support sorting, so we'll sort client-side
    };

    this.facade.loadBookmarksPaginated(options)
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        this.allBookmarks.set(response.data as any);
        this.totalItems.set(response.total);
      });
  }

  private loadCategories(): void {
    this.facade.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories.set(categories));

    this.facade.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe(tags => this.tags.set(tags));
  }

  // Public methods for component actions
  refreshBookmarks(): void {
    this.facade.refreshBookmarks();
    this.loadBookmarks();
  }

  clearError(): void {
    this.facade.clearError();
  }

  // Bookmark actions
  createBookmark(): void {
    // TODO: Navigate to create bookmark form
    console.log('Create bookmark - form not implemented yet');
  }

  editBookmark(bookmark: Bookmark): void {
    // TODO: Navigate to edit bookmark form
    console.log('Edit bookmark:', bookmark);
  }

  deleteBookmark(bookmark: Bookmark): void {
    if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
      this.facade.deleteBookmark(bookmark.bookmarkId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadBookmarks(); // Refresh the list
          }
        });
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadBookmarks();
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  }

  // Sort methods for list component
  onSort(field: string): void {
    this.sortBy.set(field);
  }

  onPageChange(page: number): void {
    this.goToPage(page);
  }
}
