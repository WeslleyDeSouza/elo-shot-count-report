import { Component, signal, computed, OnInit, OnDestroy, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ArealWeaponRelationFacade } from '../areal-weapon-relation.facade';
import { ArealCategory } from '../../areal/areal.model';
import { WeaponWithRelation } from '../areal-weapon-relation.model';

interface ExtendedArealCategory extends Omit<ArealCategory, 'areas'> {
  areas: any[];
}
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WeaponTransferComponent } from '../transfer/transfer.component';
import { EmptyStateComponent } from '../../_components';

@Component({
  selector: 'app-areal-weapon-relation-overview',
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    TranslatePipe,
    WeaponTransferComponent,
    EmptyStateComponent,
  ],
  template: `<div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="h3 mb-1">{{ title }}</h1>
              <p class="text-muted mb-0">{{ 'admin.areal_weapon_relation.overview.manage_weapon_areal_relations' | translate }}</p>
            </div>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary"
                (click)="refreshData()"
                [disabled]="loading()"
              >
                <i class="ri-refresh-line me-1"></i>
                {{ 'admin.areal_weapon_relation.overview.refresh' | translate }}
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="ri-search-line"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="{{ 'admin.areal_weapon_relation.overview.search_areals' | translate }}"
                  (input)="searchAreals($event)"
                  [value]="searchText()"
                >
              </div>
            </div>
          </div>

          <!-- Loading State -->
          @if (loading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">{{ 'admin.areal_weapon_relation.overview.loading' | translate }}...</span>
              </div>
            </div>
          }

          <!-- Error State -->
          @if (error() && !loading()) {
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ error() }}
              <button type="button" class="btn-close" (click)="clearError()"></button>
            </div>
          }

          <!-- Content -->
          @if (!loading() && !error()) {
            @if (filteredCategories().length === 0) {
              <app-empty-state
                [title]="'admin.areal_weapon_relation.overview.no_categories_found' | translate"
                iconClass="ri-folder-line"
              />
            } @else {
              <!-- Categories List -->
              @for (category of filteredCategories(); track category.id) {
                <div class="card mb-3">
                  <div class="card-header">
                    <div class="category-header cursor-pointer"
                         (click)="toggleCategoryCollapse(category.id)">
                      <div class="d-flex align-items-center">
                        <i class="ri-folder-line me-2 text-primary"></i>
                        <strong>{{ category.name }}</strong>
                        <span class="badge bg-secondary ms-2">{{ category.code }}</span>
                        <span class="text-muted ms-2">
                          ({{ category.areas.length || 0 }} {{ 'admin.areal_weapon_relation.overview.areals' | translate }})
                        </span>
                      </div>
                      <i class="ri-arrow-down-s-line"
                         [class.rotated]="!isCategoryCollapsed(category.id)"></i>
                    </div>
                  </div>

                  <div class="card-body" [ngbCollapse]="isCategoryCollapsed(category.id)">
                    @if (category.areas.length === 0) {
                      <div class="text-center text-muted py-3">
                        {{ 'admin.areal_weapon_relation.overview.no_areals_in_category' | translate }}
                      </div>
                    } @else {
                      @for (areal of category.areas; track areal.id) {
                        <div class="areal-section mb-4">
                          <div class="areal-header cursor-pointer d-flex align-items-center justify-content-between mb-3"
                               (click)="toggleArealCollapse(areal.id)">
                            <div class="d-flex align-items-center">
                              <i class="ri-map-pin-line me-2 text-success"></i>
                              <h5 class="mb-0 me-2">{{ areal.name }}</h5>
                              @if (!areal.enabled) {
                                <span class="badge bg-warning">{{ 'admin.areal_weapon_relation.overview.disabled' | translate }}</span>
                              }
                            </div>
                            <i class="ri-arrow-down-s-line"
                               [class.rotated]="!isArealCollapsed(areal.id)"></i>
                          </div>

                          <div [ngbCollapse]="isArealCollapsed(areal.id)">
                            @if(!isArealCollapsed(areal.id)){
                              <app-weapon-transfer
                                [arealId]="areal.id"
                                [arealName]="areal.name"
                                [weapons]="areal.weaponLinks || []"
                                (weaponAssigned)="onWeaponAssigned($event)"
                                (weaponUnassigned)="onWeaponUnassigned($event)"
                              />
                            }

                          </div>
                        </div>

                        @if (!$last) {
                          <hr>
                        }
                      }
                    }
                  </div>
                </div>
              }
            }
          }
        </div>
      </div>
    </div>`,
  styles: [`
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .areal-header {
      padding: 0.5rem;
      border-radius: 0.375rem;
      background-color: #f8f9fa;
      transition: background-color 0.2s ease;
    }

    .areal-header:hover {
      background-color: #e9ecef;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .ri-arrow-down-s-line {
      transition: transform 0.2s ease;
    }

    .ri-arrow-down-s-line.rotated {
      transform: rotate(-180deg);
    }

    .areal-section {
      border-left: 3px solid #e9ecef;
      padding-left: 1rem;
    }

    .areal-section:last-child {
      border-left-color: #28a745;
    }
  `]
})
export class ArealWeaponRelationOverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(ArealWeaponRelationFacade);

  allCategories = signal<ExtendedArealCategory[]>([]);
  searchText = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  collapsedStates = signal<{[key: string]: boolean}>({});
  arealCollapsedStates = signal<{[key: string]: boolean}>({});

  title = "Areal Weapon Relations";

  filteredCategories: Signal<ExtendedArealCategory[]> = computed(() => {
    const categories = this.allCategories();
    const search = this.searchText().toLowerCase();

    if (!search) {
      return categories;
    }

    const matchesCategory = (category: ExtendedArealCategory): boolean => {
      return category.name.toLowerCase().includes(search) ||
             category.code.toString().toLowerCase().includes(search);
    };

    const matchesAreal = (areal: any): boolean => {
      return areal.name.toLowerCase().includes(search);
    };

    return categories.filter(category =>
      matchesCategory(category) ||
      category.areas.some(areal => matchesAreal(areal))
    ).map(category => ({
      ...category,
      areas: category.areas.filter(areal =>
        matchesAreal(areal) ||
        matchesCategory(category)
      )
    }));
  });

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
    this.loadData();
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

    this.facade.arealCategories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.allCategories.set(categories);
        // Auto-expand first category if none are expanded yet
        if (categories.length > 0 && Object.keys(this.collapsedStates()).length === 0) {
          const firstCategoryId = categories[0].id;
          this.collapsedStates.set({ [firstCategoryId]: false });
        }
      });
  }

  private loadData(): void {
    this.facade.loadArealCategoriesWithWeapons()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  searchAreals(event: any): void {
    const searchValue = event.target.value;
    this.searchText.set(searchValue);

    // Auto-expand matching categories when searching
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      const categories = this.allCategories();
      const newStates = { ...this.collapsedStates() };

      categories.forEach(category => {
        const categoryMatches = category.name.toLowerCase().includes(search) ||
                               category.code.toString().toLowerCase().includes(search);
        const hasMatchingAreal = category.areas.some(areal =>
          areal.name.toLowerCase().includes(search)
        );

        if (categoryMatches || hasMatchingAreal) {
          newStates[category.id] = false;
        }
      });

      this.collapsedStates.set(newStates);
    }
  }

  refreshData(): void {
    this.loadData();
  }

  clearError(): void {
    this.facade.clearError();
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

  toggleArealCollapse(arealId: string): void {
    const current = this.arealCollapsedStates();
    this.arealCollapsedStates.set({
      ...current,
      [arealId]: !current[arealId]
    });
  }

  isArealCollapsed(arealId: string): boolean {
    return !(this.arealCollapsedStates()[arealId] ?? false);
  }

  onWeaponAssigned(event: { weaponId: string; arealId: string }): void {
    this.facade.createWeaponRelation(event.arealId, event.weaponId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => {
        if (!success) {
          // Only reload on failure - success is handled by local cache update
          this.loadData();
        }
      });
  }

  onWeaponUnassigned(event: { weaponId: string; relationId: string }): void {
    this.facade.removeWeaponRelation(event.relationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(success => {
        if (!success) {
          // Only reload on failure - success is handled by local cache update
          this.loadData();
        }
      });
  }
}
