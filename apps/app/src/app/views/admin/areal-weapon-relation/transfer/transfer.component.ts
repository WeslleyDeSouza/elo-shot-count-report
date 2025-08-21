import { Component, input, output, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeaponWithRelation } from '../areal-weapon-relation.model';
import { TranslatePipe } from '@app-galaxy/translate-ui';

@Component({
  selector: 'app-weapon-transfer',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe
  ],
  template: `
    <div class="transfer-container mb-4">
      <div class="row g-3">
        <!-- Available Weapons -->
        <div class="col-5">
          <div class="transfer-panel">
            <div class="transfer-header">
              <input
                type="checkbox"
                class="form-check-input"
                [checked]="isAllAvailableSelected()"
                [indeterminate]="isSomeAvailableSelected()"
                (change)="toggleAllAvailable($event)"
                id="availableSelectAll-{{ arealId() }}"
              >
              <label class="form-check-label ms-2" for="availableSelectAll-{{ arealId() }}">
                {{ filteredAvailableWeapons().length }} {{ 'AVAILABLE_WEAPONS' | translate }}
              </label>
            </div>
            <div class="transfer-search">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="{{ 'SEARCH_WEAPONS' | translate }}"
                [(ngModel)]="availableSearchText"
                (input)="updateAvailableSearch($event)"
              >
            </div>
            <div class="transfer-list">
              @for (weapon of filteredAvailableWeapons(); track weapon.id) {
                <div 
                  class="transfer-item"
                  [class.disabled]="!weapon.enabled"
                  (click)="toggleWeaponSelection(weapon, 'available')"
                >
                  <input
                    type="checkbox"
                    class="form-check-input item-checkbox"
                    [checked]="selectedAvailable().includes(weapon.id)"
                    [disabled]="!weapon.enabled"
                    (change)="$event.stopPropagation()"
                  >
                  <span class="weapon-name">{{ weapon.name }}</span>
                  @if (!weapon.enabled) {
                    <small class="text-muted ms-auto">({{ 'DISABLED' | translate }})</small>
                  }
                </div>
              }
              @if (filteredAvailableWeapons().length === 0) {
                <div class="text-center text-muted p-3">
                  {{ 'NO_WEAPONS_AVAILABLE' | translate }}
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Transfer Controls -->
        <div class="col-2">
          <div class="transfer-controls">
            <button
              class="transfer-btn btn btn-outline-primary btn-sm"
              [disabled]="selectedAvailable().length === 0"
              (click)="moveToAssigned()"
              title="{{ 'ASSIGN_SELECTED_WEAPONS' | translate }}"
            >
              <i class="ri-arrow-right-line"></i>
            </button>
            <button
              class="transfer-btn btn btn-outline-secondary btn-sm"
              [disabled]="selectedAssigned().length === 0"
              (click)="moveToAvailable()"
              title="{{ 'UNASSIGN_SELECTED_WEAPONS' | translate }}"
            >
              <i class="ri-arrow-left-line"></i>
            </button>
          </div>
        </div>

        <!-- Assigned Weapons -->
        <div class="col-5">
          <div class="transfer-panel">
            <div class="transfer-header">
              <input
                type="checkbox"
                class="form-check-input"
                [checked]="isAllAssignedSelected()"
                [indeterminate]="isSomeAssignedSelected()"
                (change)="toggleAllAssigned($event)"
                id="assignedSelectAll-{{ arealId() }}"
              >
              <label class="form-check-label ms-2" for="assignedSelectAll-{{ arealId() }}">
                {{ filteredAssignedWeapons().length }} {{ 'ASSIGNED_WEAPONS' | translate }}
              </label>
            </div>
            <div class="transfer-search">
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="{{ 'SEARCH_WEAPONS' | translate }}"
                [(ngModel)]="assignedSearchText"
                (input)="updateAssignedSearch($event)"
              >
            </div>
            <div class="transfer-list">
              @for (weapon of filteredAssignedWeapons(); track weapon.id) {
                <div 
                  class="transfer-item"
                  (click)="toggleWeaponSelection(weapon, 'assigned')"
                >
                  <input
                    type="checkbox"
                    class="form-check-input item-checkbox"
                    [checked]="selectedAssigned().includes(weapon.id)"
                    (change)="$event.stopPropagation()"
                  >
                  <span class="weapon-name">{{ weapon.name }}</span>
                </div>
              }
              @if (filteredAssignedWeapons().length === 0) {
                <div class="text-center text-muted p-3">
                  {{ 'NO_WEAPONS_ASSIGNED' | translate }}
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transfer-container {
      max-width: 800px;
    }

    .transfer-panel {
      height: 400px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      background: white;
    }

    .transfer-header {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      background: #fafafa;
      font-size: 14px;
      color: #000000d9;
      display: flex;
      align-items: center;
    }

    .transfer-search {
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .transfer-list {
      height: calc(100% - 108px);
      overflow-y: auto;
      padding: 0;
    }

    .transfer-item {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #000000d9;
      cursor: pointer;
      transition: background-color 0.2s;
      border: none;
      background: none;
    }

    .transfer-item:hover {
      background-color: #f5f5f5;
    }

    .transfer-item.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .transfer-item.disabled:hover {
      background-color: transparent;
    }

    .weapon-name {
      flex: 1;
    }

    .transfer-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
      align-items: center;
      height: 400px;
    }

    .transfer-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .transfer-list::-webkit-scrollbar {
      width: 6px;
    }

    .transfer-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .transfer-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .transfer-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class WeaponTransferComponent implements OnDestroy {
  arealId = input.required<string>();
  arealName = input.required<string>();
  weapons = input.required<WeaponWithRelation[]>();

  weaponAssigned = output<{ weaponId: string; arealId: string }>();
  weaponUnassigned = output<{ weaponId: string; relationId: string }>();

  availableSearchText = signal('');
  assignedSearchText = signal('');
  selectedAvailable = signal<string[]>([]);
  selectedAssigned = signal<string[]>([]);

  availableWeapons = computed(() => 
    this.weapons().filter(w => !w.hasRelation)
  );

  assignedWeapons = computed(() => 
    this.weapons().filter(w => w.hasRelation)
  );

  filteredAvailableWeapons = computed(() => {
    const search = this.availableSearchText().toLowerCase();
    const weapons = this.availableWeapons();
    
    if (!search) return weapons;
    
    return weapons.filter(weapon => 
      weapon.name.toLowerCase().includes(search)
    );
  });

  filteredAssignedWeapons = computed(() => {
    const search = this.assignedSearchText().toLowerCase();
    const weapons = this.assignedWeapons();
    
    if (!search) return weapons;
    
    return weapons.filter(weapon => 
      weapon.name.toLowerCase().includes(search)
    );
  });

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  updateAvailableSearch(event: any): void {
    this.availableSearchText.set(event.target.value);
  }

  updateAssignedSearch(event: any): void {
    this.assignedSearchText.set(event.target.value);
  }

  toggleWeaponSelection(weapon: WeaponWithRelation, side: 'available' | 'assigned'): void {
    if (side === 'available' && !weapon.enabled) return;

    const selectedList = side === 'available' ? this.selectedAvailable : this.selectedAssigned;
    const currentSelection = selectedList();
    const weaponId = weapon.id;

    if (currentSelection.includes(weaponId)) {
      selectedList.set(currentSelection.filter(id => id !== weaponId));
    } else {
      selectedList.set([...currentSelection, weaponId]);
    }
  }

  toggleAllAvailable(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      const enabledIds = this.filteredAvailableWeapons()
        .filter(w => w.enabled)
        .map(w => w.id);
      this.selectedAvailable.set(enabledIds);
    } else {
      this.selectedAvailable.set([]);
    }
  }

  toggleAllAssigned(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      const assignedIds = this.filteredAssignedWeapons().map(w => w.id);
      this.selectedAssigned.set(assignedIds);
    } else {
      this.selectedAssigned.set([]);
    }
  }

  isAllAvailableSelected(): boolean {
    const enabledWeapons = this.filteredAvailableWeapons().filter(w => w.enabled);
    return enabledWeapons.length > 0 && 
           enabledWeapons.every(w => this.selectedAvailable().includes(w.id));
  }

  isSomeAvailableSelected(): boolean {
    const selected = this.selectedAvailable().length;
    const total = this.filteredAvailableWeapons().filter(w => w.enabled).length;
    return selected > 0 && selected < total;
  }

  isAllAssignedSelected(): boolean {
    const assignedWeapons = this.filteredAssignedWeapons();
    return assignedWeapons.length > 0 && 
           assignedWeapons.every(w => this.selectedAssigned().includes(w.id));
  }

  isSomeAssignedSelected(): boolean {
    const selected = this.selectedAssigned().length;
    const total = this.filteredAssignedWeapons().length;
    return selected > 0 && selected < total;
  }

  moveToAssigned(): void {
    const selectedIds = this.selectedAvailable();
    selectedIds.forEach(weaponId => {
      this.weaponAssigned.emit({ weaponId, arealId: this.arealId() });
    });
    this.selectedAvailable.set([]);
  }

  moveToAvailable(): void {
    const selectedIds = this.selectedAssigned();
    const assignedWeapons = this.assignedWeapons();
    
    selectedIds.forEach(weaponId => {
      const weapon = assignedWeapons.find(w => w.id === weaponId);
      if (weapon?.relationId) {
        this.weaponUnassigned.emit({ weaponId, relationId: weapon.relationId });
      }
    });
    this.selectedAssigned.set([]);
  }
}