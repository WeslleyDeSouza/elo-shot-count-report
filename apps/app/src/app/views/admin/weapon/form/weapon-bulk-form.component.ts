import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {firstValueFrom, Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WeaponFacade } from '../weapon.facade';
import { Weapon, WeaponCategory } from '../weapon.model';
import {BulkEditorComponent, BulkEditorConfig} from "../../../../components";

interface WeaponWithCategory extends Weapon {
  categoryName: string;
  categoryCode: number;
}

@Component({
  selector: 'app-weapon-bulk-form',
  imports: [
    CommonModule,
    BulkEditorComponent,
    TranslatePipe,
  ],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12">


          @if(loading()) {
            <div class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          } @else if(error()) {
            <div class="alert alert-danger">
              {{ error() }}
            </div>
          } @else {
            <app-bulk-editor
              [title]="'weapon_bulk_editor' | translate"
              [data]="allWeapons()"
              [config]="editorConfig()"
              (save)="onSaveChanges($event)"
              (delete)="onDeleteItems($event)"
              (close)="onClose()">
            </app-bulk-editor>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 1.5rem;
      max-width: 1200px;
    }
  `
})
export class WeaponBulkFormComponent implements OnInit, OnDestroy {
  title  = "Weapon";
  subTitle = "Bulk Edit";

  private destroy$ = new Subject<void>();
  private facade = inject(WeaponFacade);
  private router = inject(Router);

  // State
  allWeapons = signal<WeaponWithCategory[]>([]);
  categories = signal<WeaponCategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Editor configuration
  editorConfig = signal<BulkEditorConfig>({
    columnDefs: [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
        editable: true
      },
      {
        field: 'nameDe',
        headerName: 'German Name',
        width: 150,
        editable: true
      },
      {
        field: 'nameFr',
        headerName: 'French Name',
        width: 150,
        editable: true
      },
      {
        field: 'nameIt',
        headerName: 'Italian Name',
        width: 150,
        editable: true
      },
      {
        field: 'categoryId',
        headerName: 'Category',
        width: 200,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: () => ({
          values: this.categories().map(cat => cat.id)
        }),
        valueFormatter: (params) => this.getCategoryName(params.value)
      },
      {
        field: 'enabled',
        headerName: 'Enabled',
        width: 100,
        editable: true,
        cellEditor: 'agCheckboxCellEditor'
      },
      {
        field: 'inWeight',
        headerName: 'In Weight',
        width: 100,
        editable: true,
        cellEditor: 'agCheckboxCellEditor'
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 150,
        editable: false,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString()
      },
      {
        field: 'updatedAt',
        headerName: 'Updated',
        width: 150,
        editable: false,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString()
      }
    ],
    canEdit: true,
    canDelete: true,
    height: 500
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
  }

  private loadData(): void {
    this.facade.loadCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories.set(categories);

        // Flatten all weapons from all categories
        const allWeapons = categories.flatMap(category =>
          category.weapons.map(weapon => {
            const extendedWeapon = new Weapon(weapon) as WeaponWithCategory;
            extendedWeapon.categoryName = category.name;
            extendedWeapon.categoryCode = category.code;
            return extendedWeapon;
          })
        );

        this.allWeapons.set(allWeapons);
      });
  }

  onSaveChanges(changedWeapons: WeaponWithCategory[]): void {
    // Process each changed weapon
    const savePromises = changedWeapons.map(weapon =>
      firstValueFrom(this.facade.updateWeapon(weapon.id, weapon))
    );

    Promise.all(savePromises)
      .then(() => {
        this.loadData(); // Refresh data
      })
      .catch(error => {
        console.error('Error saving changes:', error);
        this.error.set('Failed to save changes');
      });
  }

  onDeleteItems(selectedWeapons: WeaponWithCategory[]): void {
    const deletePromises = selectedWeapons.map(weapon =>
      this.facade.deleteWeapon(weapon.id).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.loadData(); // Refresh data
      })
      .catch(error => {
        console.error('Error deleting items:', error);
        this.error.set('Failed to delete items');
      });
  }

  onClose(): void {
    this.router.navigate(['/admin/weapon/overview']);
  }

  getCategoryOptions(): string[] {
    return this.categories().map(cat => cat.id);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category ? `${category.code} - ${category.name}` : '';
  }
}