import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Bookmark } from '../bookmarks.model';

@Component({
  selector: 'app-bookmarks-list',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <!-- Table -->
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th
                  class="border-0 cursor-pointer user-select-none"
                  (click)="onSort('title')"
                >
                  Title
                  <i
                    class="ri ms-1"
                    [class.ri-arrow-up-line]="sortBy === 'title' && sortOrder === 'ASC'"
                    [class.ri-arrow-down-line]="sortBy === 'title' && sortOrder === 'DESC'"
                    [class.ri-expand-up-down-line]="sortBy !== 'title'"
                  ></i>
                </th>
                <th class="border-0">URL</th>
                <th class="border-0">Category</th>
                <th class="border-0">Tags</th>
                <th
                  class="border-0 cursor-pointer user-select-none"
                  (click)="onSort('isPrivate')"
                >
                  Privacy
                  <i
                    class="ri ms-1"
                    [class.ri-arrow-up-line]="sortBy === 'isPrivate' && sortOrder === 'ASC'"
                    [class.ri-arrow-down-line]="sortBy === 'isPrivate' && sortOrder === 'DESC'"
                    [class.ri-expand-up-down-line]="sortBy !== 'isPrivate'"
                  ></i>
                </th>
                <th
                  class="border-0 cursor-pointer user-select-none"
                  (click)="onSort('createdAt')"
                >
                  Created
                  <i
                    class="ri ms-1"
                    [class.ri-arrow-up-line]="sortBy === 'createdAt' && sortOrder === 'ASC'"
                    [class.ri-arrow-down-line]="sortBy === 'createdAt' && sortOrder === 'DESC'"
                    [class.ri-expand-up-down-line]="sortBy !== 'createdAt'"
                  ></i>
                </th>
                <th class="border-0 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (bookmark of bookmarks; track bookmark.bookmarkId) {
                <tr class="align-middle">
                  <td>
                    <div class="d-flex align-items-center">
                      @if (bookmark.hasFavicon) {
                        <img
                          [src]="bookmark.favicon"
                          alt="Favicon"
                          class="favicon me-2"
                          width="16"
                          height="16"
                        />
                      } @else {
                        <i class="ri-global-line me-2 text-muted"></i>
                      }
                      <div>
                        <h6 class="mb-0">{{ bookmark.title }}</h6>
                        @if (bookmark.hasDescription) {
                          <small class="text-muted">
                            {{ bookmark.description }}
                          </small>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <a 
                        [href]="bookmark.url" 
                        target="_blank" 
                        class="text-decoration-none text-truncate" 
                        style="max-width: 200px;"
                      >
                        {{ bookmark.url }}
                      </a>
                      <button
                        class="btn btn-sm btn-outline-secondary ms-2"
                        (click)="copyToClipboard(bookmark.url)"
                        title="Copy URL"
                      >
                        <i class="ri-file-copy-line"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    @if (bookmark.hasCategory) {
                      <span class="badge bg-light text-dark">
                        {{ bookmark.category }}
                      </span>
                    } @else {
                      <span class="text-muted">No category</span>
                    }
                  </td>
                  <td>
                    @if (bookmark.hasTags) {
                      @for (tag of bookmark.tags; track tag) {
                        <span class="badge bg-secondary me-1 mb-1">
                          {{ tag }}
                        </span>
                      }
                    } @else {
                      <span class="text-muted">No tags</span>
                    }
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.bg-warning]="bookmark.isPrivate"
                      [class.bg-success]="bookmark.isPublic"
                    >
                      {{ bookmark.privacyLabel }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">{{ bookmark.createdAtDate | date:'short' }}</small>
                  </td>
                  <td class="text-end">
                    <div class="dropdown" ngbDropdown placement="bottom-right">
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        type="button"
                        ngbDropdownToggle
                      >
                        <i class="ri-more-line"></i>
                      </button>
                      <div class="dropdown-menu" ngbDropdownMenu>
                        <button class="dropdown-item" (click)="openBookmark(bookmark)">
                          <i class="ri-external-link-line me-2"></i>
                          Open
                        </button>
                        <button class="dropdown-item" (click)="onEdit(bookmark)">
                          <i class="ri-edit-line me-2"></i>
                          Edit
                        </button>
                        <button
                          class="dropdown-item"
                          (click)="copyToClipboard(bookmark.url)"
                        >
                          <i class="ri-file-copy-line me-2"></i>
                          Copy URL
                        </button>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item text-danger" (click)="onDelete(bookmark)">
                          <i class="ri-delete-bin-line me-2"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="d-flex justify-content-between align-items-center p-3 border-top">
            <div class="text-muted small">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} results
            </div>
            <ngb-pagination
              [(page)]="currentPage"
              [pageSize]="pageSize"
              [collectionSize]="totalCount"
              [maxSize]="5"
              [rotate]="true"
              [boundaryLinks]="true"
              (pageChange)="onPageChange($event)"
            >
            </ngb-pagination>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
    .favicon {
      border-radius: 2px;
    }
    .text-truncate {
      max-width: 200px;
    }
  `]
})
export class BookmarksListComponent {
  @Input() bookmarks: Bookmark[] = [];
  @Input() sortBy: string = 'createdAt';
  @Input() sortOrder: 'ASC' | 'DESC' = 'DESC';
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPages: number = 1;
  @Input() totalCount: number = 0;

  @Output() edit = new EventEmitter<Bookmark>();
  @Output() delete = new EventEmitter<Bookmark>();
  @Output() sort = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  onEdit(bookmark: Bookmark): void {
    this.edit.emit(bookmark);
  }

  onDelete(bookmark: Bookmark): void {
    this.delete.emit(bookmark);
  }

  onSort(field: string): void {
    this.sort.emit(field);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  openBookmark(bookmark: Bookmark): void {
    window.open(bookmark.url, '_blank');
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('URL copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy to clipboard', err);
    });
  }
}