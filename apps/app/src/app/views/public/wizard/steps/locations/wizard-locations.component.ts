import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { PublicCollectionService, ArealCategoryModel, WeaponModel } from "@ui-elo/apiClient";
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

export interface LocationFormData {
  arealId: string;
  arealCategoryId: string;
  weapons: { [weaponId: string]: number };
}

@Component({
  selector: 'app-wizard-locations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="h4 mb-2">{{ 'wizard.locations.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.locations.subtitle' | translate }}</p>
              </div>

              <!-- Locations Form -->
              <form [formGroup]="locationsForm" (ngSubmit)="onNext()">
                <div formArrayName="locations">
                  @for (locationControl of locationControls.controls; track locationControl; let i = $index) {
                    <div class="card mb-4" [class.border-primary]="locationControls.controls.length === 1">
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                          <i class="ri-map-pin-line me-2"></i>
                          {{ 'wizard.locations.location' | translate }} {{ i + 1 }}
                        </h6>
                        @if (locationControls.controls.length > 1) {
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            (click)="removeLocation(i)">
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        }
                      </div>
                      <div class="card-body">
                        <div [formGroupName]="i">
                          <div class="row">
                            <!-- Areal Selection -->
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label">
                                  {{ 'wizard.locations.areal' | translate }} <span class="text-danger">*</span>
                                </label>
                                <select
                                  class="form-select"
                                  formControlName="arealId"
                                  (change)="onArealChange(i)"
                                  [class.is-invalid]="isLocationFieldInvalid(i, 'arealId')">
                                  <option value="">{{ 'wizard.locations.select_areal' | translate }}</option>
                                  @for(category of availableAreals(); track category.id) {
                                    <optgroup label="{{category?.name}}">
                                      @for(areal of category?.areas; track areal.id) {
                                        <option [value]="areal.id">{{ areal.name }}</option>
                                      }
                                    </optgroup>
                                  }
                                </select>
                                @if(isLocationFieldInvalid(i, 'arealId')) {
                                  <div class="invalid-feedback">
                                    {{ 'wizard.locations.areal_required' | translate }}
                                  </div>
                                }
                              </div>
                            </div>

                            <!-- Weapons Selection -->
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label">
                                  {{ 'wizard.locations.weapons' | translate }} <span class="text-danger">*</span>
                                </label>
                                <div class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                                  @if (getAvailableWeapons(i).length === 0) {
                                    <p class="text-muted mb-0 small">{{ 'wizard.locations.select_areal_first' | translate }}</p>
                                  } @else {
                                    <div class="row" formGroupName="weapons">
                                      @for (weapon of getAvailableWeapons(i); track weapon.id) {
                                        <div class="col-12 mb-2">
                                          <div class="d-flex align-items-center">
                                            <label class="form-label mb-0 me-auto">{{ weapon.name }}</label>
                                            <input
                                              type="number"
                                              class="form-control form-control-sm"
                                              style="width: 80px;"
                                              min="0"
                                              placeholder="0"
                                              [formControlName]="weapon.id">
                                          </div>
                                        </div>
                                      }
                                    </div>
                                  }
                                </div>
                                @if(isLocationWeaponsInvalid(i)) {
                                  <div class="text-danger small mt-1">
                                    {{ 'wizard.locations.weapons_required' | translate }}
                                  </div>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <!-- Add Location Button -->
                <div class="text-center mb-4">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    (click)="addLocation()">
                    <i class="ri-add-line me-1"></i>
                    {{ 'wizard.locations.add_location' | translate }}
                  </button>
                </div>

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
                      type="submit"
                      class="btn btn-primary w-100"
                      [disabled]="!isFormValid()">
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
  styles: [`
    .card-header {
      background-color: rgba(var(--bs-primary-rgb), 0.1);
    }
  `]
})
export class WizardLocationsComponent implements OnInit {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private publicService = inject(PublicCollectionService);

  wizardService = inject(WizardService);
  availableAreals = signal<ArealCategoryModel[]>([]);
  weaponsByAreal = signal<{ [arealId: string]: WeaponModel[] }>({});

  locationsForm = this.formBuilder.group({
    locations: this.formBuilder.array([this.createLocationForm()])
  });

  get locationControls(): FormArray {
    return this.locationsForm.get('locations') as FormArray;
  }

  ngOnInit(): void {
    this.loadAvailableAreals();
  }

  createLocationForm(): FormGroup {
    return this.formBuilder.group({
      arealId: ['', [Validators.required]],
      arealCategoryId: [''],
      weapons: this.formBuilder.group({})
    });
  }

  addLocation(): void {
    this.locationControls.push(this.createLocationForm());
  }

  removeLocation(index: number): void {
    if (this.locationControls.length > 1) {
      this.locationControls.removeAt(index);
    }
  }

  isLocationFieldInvalid(locationIndex: number, fieldName: string): boolean {
    const locationControl = this.locationControls.at(locationIndex);
    const field = locationControl?.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  isLocationWeaponsInvalid(locationIndex: number): boolean {
    const locationControl = this.locationControls.at(locationIndex);
    const weaponsGroup = locationControl?.get('weapons') as FormGroup;
    const arealId = locationControl?.get('arealId')?.value;

    if (!arealId || !weaponsGroup) return false;

    const weapons = weaponsGroup.value;
    const hasAnyWeapon = Object.values(weapons).some((count: any) => count && count > 0);
    return !hasAnyWeapon;
  }

  isFormValid(): boolean {
    if (this.locationsForm.invalid) return false;

    // Check if each location has at least one weapon selected
    for (let i = 0; i < this.locationControls.length; i++) {
      const locationControl = this.locationControls.at(i);
      const arealId = locationControl?.get('arealId')?.value;

      if (!arealId) return false;

      if (this.isLocationWeaponsInvalid(i)) return false;
    }

    return true;
  }

  getAvailableWeapons(locationIndex: number): WeaponModel[] {
    const locationControl = this.locationControls.at(locationIndex);
    const arealId = locationControl?.get('arealId')?.value;

    if (!arealId) return [];

    return this.weaponsByAreal()[arealId] || [];
  }

  async onArealChange(locationIndex: number): Promise<void> {
    const locationControl = this.locationControls.at(locationIndex);
    const selectedArealId = locationControl?.get('arealId')?.value;

    if (!selectedArealId) return;

    // Find and set category ID
    const selectedAreal = this.availableAreals()
      .flatMap(category => category.areas)
      .find(areal => areal.id === selectedArealId);

    if (selectedAreal) {
      locationControl?.patchValue({
        arealCategoryId: selectedAreal.categoryId
      });

      // Load weapons for this areal if not already loaded
      if (!this.weaponsByAreal()[selectedArealId]) {
        await this.loadWeaponsForAreal(selectedArealId);
      }

      // Update weapons form group
      this.updateWeaponsFormGroup(locationIndex, selectedArealId);
    }
  }

  private updateWeaponsFormGroup(locationIndex: number, arealId: string): void {
    const locationControl = this.locationControls.at(locationIndex) as FormGroup;
    const weapons = this.weaponsByAreal()[arealId] || [];

    const weaponsGroup = this.formBuilder.group({});
    weapons.forEach(weapon => {
      weaponsGroup.addControl(weapon.id, this.formBuilder.control(0));
    });

    locationControl?.setControl('weapons', weaponsGroup);
  }

  onNext(): void {
    this.locationsForm.markAllAsTouched();

    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.locationsForm.value;
    this.wizardService.updateCollectionData('locations', formValue.locations);
    this.wizardService.nextStep();
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.SUMMARY]);
  }

  onBack(): void {
    this.wizardService.previousStep();
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.DATE_TIME]);
  }

  private async loadAvailableAreals(): Promise<void> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      const response = await firstValueFrom(
        this.publicService.publicCollectionListAreal({ identifier })
      );
      this.availableAreals.set(response || []);
    } catch (error) {
      console.error('Failed to load areals:', error);
    }
  }

  private async loadWeaponsForAreal(arealId: string): Promise<void> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      
      // Find the category ID for this areal
      const selectedAreal = this.availableAreals()
        .flatMap(category => category.areas)
        .find(areal => areal.id === arealId);
      
      if (!selectedAreal?.categoryId) {
        console.error('Could not find category for areal:', arealId);
        return;
      }

      const response = await firstValueFrom(
        this.publicService.publicCollectionListWeaponFromAreal({ 
          identifier, 
          arealCategoryId: selectedAreal.categoryId 
        })
      );

      // Flatten the weapon categories into a simple array
      const weapons = (response || []).flatMap(category => 
        category.weapons?.map(weapon => ({
          ...weapon,
          categoryName: category.name
        })) || []
      );

      const currentWeapons = this.weaponsByAreal();
      this.weaponsByAreal.set({
        ...currentWeapons,
        [arealId]: weapons
      });
    } catch (error) {
      console.error('Failed to load weapons for areal:', error);
    }
  }
}
