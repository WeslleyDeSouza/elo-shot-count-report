import {Component, signal, computed, OnInit, OnDestroy, inject, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ArealFacade } from '../areal.facade';
import {Areal, ArealCategory,  } from '../areal.model';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Router } from '@angular/router';
import {EmptyStateComponent} from "../../../../components";

const PATHS = {
  AREAL_CREATE: '/admin/areal/create',
  AREAL_EDIT: '/admin/areal/edit',
  AREAL_CREATE_CATEGORY: '/admin/areal/create-category',
  AREAL_EDIT_CATEGORY: '/admin/areal/edit-category',
  AREAL_BULK_EDIT: '/admin/areal/bulk-edit'
} as const;

@Component({
  selector: 'app-areal',
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    TranslatePipe,
    EmptyStateComponent,
  ],
  templateUrl: './areal.component.html',
  styles: `
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }


    .cursor-pointer {
      cursor: pointer;
    }
  `
})
export class ArealComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(ArealFacade);
  private router = inject(Router);

  allCategories = signal<ArealCategory[]>([]);
  searchText = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  collapsedStates = signal<{[key: string]: boolean}>({});

  title = "Areal";
  subTitle = "Areas";

  filteredCategories:Signal<ArealCategory[]> = computed(() => {
    const categories = this.allCategories();
    const search = this.searchText().toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter(category =>
      category.name.toLowerCase().includes(search) ||
      category.areas.some(area => area.name.toLowerCase().includes(search))
    ).map(category => (<ArealCategory>{
      ...category,
      areas: category.areas.filter(area =>
        area.name.toLowerCase().includes(search) ||
        category.name.toLowerCase().includes(search)
      )
    }));
  });

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFacadeSubscriptions(): void {
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  private loadCategories(): void {
    this.facade.loadCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.allCategories.set(categories);
      });
  }

  searchAreas(event: any): void {
    this.searchText.set(event.target.value);
  }

  refreshAreas(): void {
    this.facade.refreshCategories();
    this.loadCategories();
  }

  clearError(): void {
    this.facade.clearError();
  }

  createAreal(categoryId?: string): void {
    if (categoryId) {
      this.router.navigate([PATHS.AREAL_CREATE], { queryParams: { categoryId } });
    } else {
      this.router.navigate([PATHS.AREAL_CREATE]);
    }
  }

  editAreal(areal: Areal): void {
    this.router.navigate([PATHS.AREAL_EDIT, areal.id]);
  }

  deleteAreal(areal: Areal): void {
    if (confirm(`Are you sure you want to delete ${areal.name}?`)) {
      this.facade.deleteAreal(areal.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCategories();
          }
        });
    }
  }

  createArealCategory(): void {
    this.router.navigate([PATHS.AREAL_CREATE_CATEGORY]);
  }

  editArealCategory(category: ArealCategory): void {
    this.router.navigate([PATHS.AREAL_EDIT_CATEGORY, category.id]);
  }

  deleteArealCategory(category: ArealCategory): void {
    if (confirm(`Are you sure you want to delete category ${category.name}?`)) {
      this.facade.deleteArealCategory(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCategories();
          }
        });
    }
  }

  toggleArealEnabled(areal: Areal): void {
    const updatedAreal = { ...areal, enabled: !areal.enabled };
    this.facade.updateAreal(areal.id, updatedAreal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadCategories();
        }
      });
  }

  toggleCategoryCollapse(categoryId: string): void {
    const current = this.collapsedStates();
    this.collapsedStates.set({
      ...current,
      [categoryId]: !current[categoryId]
    });
  }

  isCategoryCollapsed(categoryId: string): boolean {
    return this.collapsedStates()[categoryId] ?? true;
  }

  openBulkEditor(): void {
    this.router.navigate([PATHS.AREAL_BULK_EDIT]);
  }
}
