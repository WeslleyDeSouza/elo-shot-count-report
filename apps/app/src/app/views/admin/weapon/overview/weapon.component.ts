import {Component, signal, computed, OnInit, OnDestroy, inject, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { WeaponFacade } from '../weapon.facade';
import {Weapon, WeaponCategory} from '../weapon.model';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Router } from '@angular/router';
import {EmptyStateComponent} from "../../_components/empty-state";

const PATHS = {
  WEAPON_CREATE: '/admin/weapon/create',
  WEAPON_EDIT: '/admin/weapon/edit',
  WEAPON_CREATE_CATEGORY: '/admin/weapon/create-category',
  WEAPON_EDIT_CATEGORY: '/admin/weapon/edit-category',
  WEAPON_BULK_EDIT: '/admin/weapon/bulk-edit'
} as const;

@Component({
  selector: 'app-weapon',
  imports: [
    CommonModule,
    FormsModule,
    NgbCollapseModule,
    TranslatePipe,
    EmptyStateComponent
  ],
  templateUrl: './weapon.component.html',
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
export class WeaponComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(WeaponFacade);
  private router = inject(Router);

  allCategories = signal<WeaponCategory[]>([]);
  searchText = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  collapsedStates = signal<{[key: string]: boolean}>({});

  title = "Weapon";
  subTitle = "Weapons";

  filteredCategories: Signal<WeaponCategory[]> = computed(() => {
    const categories = this.allCategories();
    const search = this.searchText().toLowerCase();

    if (!search) {
      return categories;
    }

    const matchesWeapon = (weapon: Weapon): boolean => {
      return weapon.name.toLowerCase().includes(search) ||
             weapon.nameDe.toLowerCase().includes(search) ||
             weapon.nameFr.toLowerCase().includes(search) ||
             weapon.nameIt.toLowerCase().includes(search);
    };

    return categories.filter(category =>
      category.name.toLowerCase().includes(search) ||
      category.weapons.some(weapon => matchesWeapon(weapon))
    ).map(category => {
      const filteredCategory = new WeaponCategory(category);
      filteredCategory.weapons = category.weapons.filter(weapon =>
        matchesWeapon(weapon) ||
        category.name.toLowerCase().includes(search)
      );
      return filteredCategory;
    });
  });

  isAllExpanded: Signal<boolean> = computed(() => {
    const categories = this.filteredCategories();
    const collapsed = this.collapsedStates();
    return categories.length > 0 && categories.every(cat => !collapsed[cat.id]);
  });

  canAddWeapon = computed(() => this.allCategories().length >= 1);
  canBulkEdit = computed(() => this.allCategories().length >= 3);

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

  searchWeapons(event: any): void {
    const searchValue = event.target.value;
    this.searchText.set(searchValue);

    // Auto-expand matching categories when searching
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      const categories = this.allCategories();
      const newStates = { ...this.collapsedStates() };

      categories.forEach(category => {
        const categoryMatches = category.name.toLowerCase().includes(search);
        const hasMatchingWeapon = category.weapons.some(weapon =>
          weapon.name.toLowerCase().includes(search) ||
          weapon.nameDe.toLowerCase().includes(search) ||
          weapon.nameFr.toLowerCase().includes(search) ||
          weapon.nameIt.toLowerCase().includes(search)
        );

        if (categoryMatches || hasMatchingWeapon) {
          newStates[category.id] = false;
        }
      });

      this.collapsedStates.set(newStates);
    }
  }

  refreshWeapons(): void {
    this.facade.refreshCategories();
    this.loadCategories();
  }

  clearError(): void {
    this.facade.clearError();
  }

  createWeapon(categoryId?: string): void {
    if (categoryId) {
      this.router.navigate([PATHS.WEAPON_CREATE], { queryParams: { categoryId } });
    } else {
      this.router.navigate([PATHS.WEAPON_CREATE]);
    }
  }

  editWeapon(weapon: Weapon): void {
    this.router.navigate([PATHS.WEAPON_EDIT, weapon.id]);
  }

  deleteWeapon(weapon: Weapon): void {
    if (confirm(`Are you sure you want to delete ${weapon.name}?`)) {
      this.facade.deleteWeapon(weapon.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCategories();
          }
        });
    }
  }

  createWeaponCategory(): void {
    this.router.navigate([PATHS.WEAPON_CREATE_CATEGORY]);
  }

  editWeaponCategory(category: WeaponCategory): void {
    this.router.navigate([PATHS.WEAPON_EDIT_CATEGORY, category.id]);
  }

  deleteWeaponCategory(category: WeaponCategory): void {
    if (confirm(`Are you sure you want to delete category ${category.name}?`)) {
      this.facade.deleteWeaponCategory(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadCategories();
          }
        });
    }
  }

  toggleWeaponEnabled(weapon: Weapon): void {
    const updatedWeapon = { ...weapon, enabled: !weapon.enabled };
    this.facade.updateWeapon(weapon.id, updatedWeapon)
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

  toggleExpandAll(): void {
    const categories = this.filteredCategories();
    const shouldExpandAll = !this.isAllExpanded();
    const newStates: {[key: string]: boolean} = {};

    categories.forEach(category => {
      newStates[category.id] = !shouldExpandAll;
    });

    this.collapsedStates.set(newStates);
  }

  openBulkEditor(): void {
    this.router.navigate([PATHS.WEAPON_BULK_EDIT]);
  }
}
