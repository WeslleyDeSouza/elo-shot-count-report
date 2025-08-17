import { Component, input, output, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent, CellValueChangedEvent } from 'ag-grid-community';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Subject, takeUntil } from 'rxjs';

export interface BulkEditorConfig {
  columnDefs: ColDef[];
  canEdit?: boolean;
  canDelete?: boolean;
  height?: number;
}

@Component({
  selector: 'app-bulk-editor',
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    TranslatePipe
  ],
  template: `
    <div class="bulk-editor">
      <!-- Toolbar -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="mb-0">{{ title() }}</h5>
          @if(selectedCount() > 0) {
            <small class="text-muted">{{ selectedCount() }} {{ 'items_selected' | translate }}</small>
          }
        </div>
        <div class="d-flex gap-2">
          @if(config().canEdit) {
            <button
              type="button"
              class="btn btn-primary btn-sm"
              [disabled]="!hasChanges()"
              (click)="saveChanges()">
              <i class="ri-save-line"></i> {{ 'save_changes' | translate }}
            </button>
          }
          @if(config().canDelete) {
            <button
              type="button"
              class="btn btn-danger btn-sm"
              [disabled]="selectedCount() === 0"
              (click)="deleteSelected()">
              <i class="ri-delete-bin-line"></i> {{ 'delete_selected' | translate }}
            </button>
          }
          <button type="button" class="btn btn-secondary btn-sm" (click)="close.emit()">
            <i class="ri-close-line"></i> {{ 'close' | translate }}
          </button>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="grid-container">
        <ag-grid-angular
          class="ag-theme-alpine"
          [rowData]="data()"
          [columnDefs]="config().columnDefs"
          [defaultColDef]="defaultColDef"
          [rowSelection]="{ mode: 'multiRow', checkboxes: true, headerCheckbox: true }"
          [animateRows]="true"
          [stopEditingWhenCellsLoseFocus]="true"
          [style.height]="(config().height || 400) + 'px'"
          (gridReady)="onGridReady($event)"
          (selectionChanged)="onSelectionChanged($event)"
          (cellValueChanged)="onCellValueChanged($event)">
        </ag-grid-angular>
      </div>

      <!-- Status bar -->
      <div class="mt-2 text-muted small">
        {{ data().length }} {{ 'total_items' | translate }}
        @if(hasChanges()) {
          <span class="text-warning ms-2">
            <i class="ri-alert-line"></i> {{ 'unsaved_changes' | translate }}
          </span>
        }
      </div>
    </div>
  `,
  styles: `
    .bulk-editor {
      background: white;
      border-radius: 0.375rem;
      border: 1px solid #dee2e6;
      padding: 1rem;
    }

    .grid-container {
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    ag-grid-angular {
      width: 100%;
    }
  `
})
export class BulkEditorComponent<T = any> implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private gridApi!: GridApi;

  // Inputs
  title = input<string>('Bulk Editor');
  data = input<T[]>([]);
  config = input<BulkEditorConfig>({ columnDefs: [] });

  // Outputs
  save = output<T[]>();
  delete = output<T[]>();
  close = output<void>();

  // Internal state
  selectedItems = signal<T[]>([]);
  changedItems = signal<Set<T>>(new Set());

  selectedCount = signal(0);
  hasChanges = signal(false);

  // AG Grid configuration
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    editable: true
  };

  ngOnInit(): void {
    // Initialize any setup if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data).filter(Boolean);

    this.selectedItems.set(selectedData);
    this.selectedCount.set(selectedData.length);
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    console.log('Cell value changed:', {
      field: event.colDef.field,
      oldValue: event.oldValue,
      newValue: event.newValue,
      data: event.data,
      fullEvent: event
    });
    
    if (event.newValue !== event.oldValue) {
      // Track changes
      const changed = new Set(this.changedItems());
      changed.add(event.data);
      this.changedItems.set(changed);
      this.hasChanges.set(changed.size > 0);
    }
  }

  saveChanges(): void {
    const changed = Array.from(this.changedItems());
    console.log('Saving changes:', changed);
    if (changed.length > 0) {
      this.save.emit(changed);
      this.changedItems.set(new Set());
      this.hasChanges.set(false);
    }
  }

  deleteSelected(): void {
    const selected = this.selectedItems();
    if (selected.length > 0) {
      if (confirm(`Are you sure you want to delete ${selected.length} items?`)) {
        this.delete.emit(selected);
      }
    }
  }
}
