import {Component, signal, computed, OnInit, OnDestroy, inject, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeaponFacade } from '../weapon.facade';
import {Weapon, WeaponCategory} from '../weapon.model';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Router } from '@angular/router';

const PATHS = {
  WEAPON_CREATE: '/admin/weapon/create',
  WEAPON_EDIT: '/admin/weapon/edit',
  WEAPON_CREATE_CATEGORY: '/admin/weapon/create-category',
  WEAPON_EDIT_CATEGORY: '/admin/weapon/edit-category'
} as const;

@Component({
  selector: 'app-weapon',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe
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

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #007bff;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
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

  title = "Weapon";
  subTitle = "Weapons";

  filteredCategories: Signal<WeaponCategory[]> = computed(() => {
    const categories = this.allCategories();
    const search = this.searchText().toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter(category =>
      category.name.toLowerCase().includes(search) ||
      category.weapons.some(weapon => weapon.name.toLowerCase().includes(search))
    ).map(category => {
      const filteredCategory = new WeaponCategory(category);
      filteredCategory.weapons = category.weapons.filter(weapon =>
        weapon.name.toLowerCase().includes(search) ||
        category.name.toLowerCase().includes(search)
      );
      return filteredCategory;
    });
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

  searchWeapons(event: any): void {
    this.searchText.set(event.target.value);
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
}