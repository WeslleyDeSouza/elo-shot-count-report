import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {firstValueFrom, Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { ArealFacade } from '../areal.facade';
import { Areal, ArealCategory } from '../areal.model';
import {BulkEditorComponent, BulkEditorConfig} from "../../../../components";

interface ArealWithCategory extends Areal {
  categoryName: string;
  categoryCode: string;
}

@Component({
  selector: 'app-areal-bulk-form',
  imports: [
    CommonModule,
    BulkEditorComponent,
    TranslatePipe,
    RouterLink
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
              [title]="'areal_bulk_editor' | translate"
              [data]="allAreals()"
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
export class ArealBulkFormComponent implements OnInit, OnDestroy {
  title  = "Areal";
  subTitle = "Bulk Edit";

  private destroy$ = new Subject<void>();
  private facade = inject(ArealFacade);
  private router = inject(Router);

  // State
  allAreals = signal<ArealWithCategory[]>([]);
  categories = signal<ArealCategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Editor configuration
  editorConfig = signal<BulkEditorConfig>({
    columnDefs: [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
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

        // Flatten all areals from all categories
        const allAreals = categories.flatMap(category =>
          category.areas.map(areal => {
            const extendedAreal = new Areal(areal) as ArealWithCategory;
            extendedAreal.categoryName = category.name;
            extendedAreal.categoryCode = category.code;
            return extendedAreal;
          })
        );

        this.allAreals.set(allAreals);
      });
  }

  onSaveChanges(changedAreals: ArealWithCategory[]): void {
    // Process each changed areal
    const savePromises = changedAreals.map(areal =>
      firstValueFrom(this.facade.updateAreal(areal.id, areal))
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

  onDeleteItems(selectedAreals: ArealWithCategory[]): void {
    const deletePromises = selectedAreals.map(areal =>
      this.facade.deleteAreal(areal.id).toPromise()
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
    this.router.navigate(['/admin/areal/overview']);
  }

  getCategoryOptions(): string[] {
    return this.categories().map(cat => cat.id);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category ? `${category.code} - ${category.name}` : '';
  }
}
