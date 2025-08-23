import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { PublicCollectionService } from '@ui-elo/apiClient';
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';
import { EmptyStateComponent } from "../../../../admin/_components";

@Component({
  selector: 'app-wizard-ammunition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    EmptyStateComponent
  ],
  template: `
    <div class="container-fluid d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="h4 mb-2">{{ 'wizard.ammunition.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.ammunition.subtitle' | translate }}</p>
              </div>

              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 60%"></div>
              </div>

              <!-- Add Weapon Form -->
              <div class="card bg-light mb-4">
                <div class="card-header bg-transparent d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">{{ 'wizard.ammunition.add_weapon' | translate }}</h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    (click)="showAddWeaponForm.set(!showAddWeaponForm())">
                    <i [class]="showAddWeaponForm() ? 'ri-close-line' : 'ri-add-line'"></i>
                    {{ showAddWeaponForm() ? ('wizard.common.cancel' | translate) : ('wizard.ammunition.add_weapon' | translate) }}
                  </button>
                </div>
                @if(showAddWeaponForm()) {
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <select
                          class="form-select"
                          [(ngModel)]="selectedWeaponId"
                          [ngModelOptions]="{standalone: true}">
                          <option value="">{{ 'wizard.ammunition.select_weapon' | translate }}</option>
                          @for(weapon of getAvailableWeaponsForSelection(); track weapon.id) {
                            <option [value]="weapon.id">{{ weapon.name }} ({{ weapon.categoryName }})</option>
                          }
                        </select>
                      </div>
                      <div class="col-md-4">
                        <input
                          type="number"
                          class="form-control"
                          [(ngModel)]="selectedWeaponCount"
                          [ngModelOptions]="{standalone: true}"
                          min="1"
                          placeholder="{{ 'wizard.ammunition.count' | translate }}">
                      </div>
                      <div class="col-md-2">
                        <button
                          type="button"
                          class="btn btn-success w-100"
                          (click)="addWeapon()"
                          [disabled]="!selectedWeaponId() || !selectedWeaponCount()">
                          <i class="ri-add-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Weapons List -->
              <form [formGroup]="wizardService.weaponsForm">
                @if(weaponsArray.length > 0) {
                  <div class="card mb-4">
                    <div class="card-header">
                      <h6 class="mb-0">{{ 'wizard.ammunition.selected_weapons' | translate }}</h6>
                    </div>
                    <div class="card-body p-0">
                      <div class="table-responsive">
                        <table class="table table-hover mb-0">
                          <thead class="table-light">
                            <tr>
                              <th>{{ 'wizard.ammunition.weapon_name' | translate }}</th>
                              <th width="120">{{ 'wizard.ammunition.count' | translate }}</th>
                              <th width="80">{{ 'wizard.common.actions' | translate }}</th>
                            </tr>
                          </thead>
                          <tbody formArrayName="weapons">
                            @for(weaponControl of weaponsArray.controls; track $index; let i = $index) {
                              <tr [formGroupName]="i">
                                <td class="align-middle">
                                  <div class="d-flex align-items-center">
                                    <i class="ri-sword-line me-2 text-primary"></i>
                                    <strong>{{ getWeaponLabel(i) }}</strong>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    class="form-control form-control-sm"
                                    formControlName="count"
                                    min="0">
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    (click)="removeWeapon(i)"
                                    title="{{ 'wizard.ammunition.remove_weapon' | translate }}">
                                    <i class="ri-delete-bin-line"></i>
                                  </button>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="card mb-4">
                    <div class="card-body text-center py-5">
                      <app-empty-state
                        [title]="'wizard.ammunition.no_weapons' | translate"
                        [subtitle]="'wizard.ammunition.add_weapons_subtitle' | translate"
                        iconClass="ri-sword-line"
                        [compact]="true">
                        <button
                          type="button"
                          class="btn btn-primary btn-sm"
                          (click)="showAddWeaponForm.set(true)">
                          <i class="ri-add-line"></i> {{ 'wizard.ammunition.add_first_weapon' | translate }}
                        </button>
                      </app-empty-state>
                    </div>
                  </div>
                }

                <!-- Actions -->
                <div class="row">
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-outline-secondary w-100"
                      (click)="onBack()">
                      <i class="ri-arrow-left-line me-1"></i>
                      {{ 'wizard.common.back' | translate }}
                    </button>
                  </div>
                  <div class="col-6">
                    <button
                      type="button"
                      class="btn btn-primary w-100"
                      (click)="onNext()"
                      [disabled]="weaponsArray.length === 0">
                      <i class="ri-arrow-right-line me-1"></i>
                      {{ 'wizard.common.next' | translate }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WizardAmmunitionComponent implements OnInit {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private publicService = inject(PublicCollectionService);

  wizardService = inject(WizardService);
  availableWeapons = signal<any[]>([]);
  selectedWeaponId = signal<string>('');
  selectedWeaponCount = signal<number>(1);
  showAddWeaponForm = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAvailableWeapons();
  }

  get weaponsArray(): FormArray {
    return this.wizardService.weaponsForm.get('weapons') as FormArray;
  }

  getWeaponLabel(index: number): string {
    const weaponControl = this.weaponsArray.at(index);
    const weaponId = weaponControl?.get('id')?.value;
    const weapon = this.availableWeapons().find(w => w.id === weaponId);
    return weapon ? `${weapon.name} (${weapon.categoryName})` : `Weapon ${weaponId}`;
  }

  getAvailableWeaponsForSelection(): any[] {
    const currentWeaponIds = this.weaponsArray.controls.map(control => control.get('id')?.value);
    return this.availableWeapons().filter(weapon => !currentWeaponIds.includes(weapon.id));
  }

  addWeapon(): void {
    const weaponId = this.selectedWeaponId();
    const count = this.selectedWeaponCount();

    if (weaponId && count > 0) {
      const weaponFormGroup = this.formBuilder.group({
        id: [weaponId],
        count: [count, [Validators.min(1)]]
      });

      this.weaponsArray.push(weaponFormGroup);
      this.selectedWeaponId.set('');
      this.selectedWeaponCount.set(1);
      this.showAddWeaponForm.set(false);
    }
  }

  removeWeapon(index: number): void {
    this.weaponsArray.removeAt(index);
  }

  onNext(): void {
    if (this.weaponsArray.length === 0) {
      return;
    }

    const weaponsData: { [weaponId: string]: number } = {};
    this.weaponsArray.controls.forEach(control => {
      const weaponId = control.get('id')?.value;
      const count = control.get('count')?.value;
      if (weaponId && count > 0) {
        weaponsData[weaponId] = count;
      }
    });

    this.wizardService.updateCollectionData('weapons', weaponsData);
    this.wizardService.nextStep();
    this.router.navigate([WIZARD_ROUTES.BASE,WIZARD_ROUTES.SUMMARY]);
  }

  onBack(): void {
    this.wizardService.previousStep();
    this.router.navigate([WIZARD_ROUTES.BASE,WIZARD_ROUTES.DATE_LOCATION]);
  }

  private async loadAvailableWeapons(): Promise<void> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      const selectedArealId = this.wizardService.locationForm.get('arealCategoryId')?.value;

      if (!selectedArealId) {
        console.warn('No areal category selected');
        return;
      }

      const response = await firstValueFrom(
        this.publicService.publicCollectionListWeaponFromAreal({ identifier, arealCategoryId: selectedArealId })
      );

      const weapons = (response || []).flatMap((category: any) =>
        category.weapons.map((weapon: any) => ({
          ...weapon,
          categoryName: category.name
        }))
      );
      this.availableWeapons.set(weapons);
    } catch (error) {
      console.error('Failed to load weapons:', error);
    }
  }
}
