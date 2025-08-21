import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import {PublicCollectionService,  ArealCategoryModel} from "@ui-elo/apiClient";
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

@Component({
  selector: 'app-wizard-date-location',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="h4 mb-2">{{ 'wizard.date_location.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.date_location.subtitle' | translate }}</p>
              </div>

              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 40%"></div>
              </div>

              <!-- Form -->
              <form [formGroup]="wizardService.locationForm" (ngSubmit)="onNext()">
                <div class="row">
                  <!-- Areal Selection -->
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">
                        {{ 'wizard.date_location.areal' | translate }} <span class="text-danger">*</span>
                      </label>
                      <select
                        class="form-select"
                        formControlName="arealId"
                        (change)="onArealChange()"
                        [class.is-invalid]="isFieldInvalid('arealId')">
                        <option value="">{{ 'wizard.date_location.select_areal' | translate }}</option>
                        @for(category of availableAreals(); track category.id) {
                          <optgroup label="{{category?.name}}">
                            @for(areal of category?.areas; track areal.id) {
                              <option [value]="areal.id">{{ areal.name }}</option>
                            }
                          </optgroup>
                        }
                      </select>
                      @if(isFieldInvalid('arealId')) {
                        <div class="invalid-feedback">
                          {{ 'wizard.date_location.areal_required' | translate }}
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="col-md-6">
                    <div class="mb-4">
                      <label class="form-label">
                        {{ 'wizard.date_location.date' | translate }} <span class="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        class="form-control"
                        formControlName="date"
                        [class.is-invalid]="isFieldInvalid('date')">
                      @if(isFieldInvalid('date')) {
                        <div class="invalid-feedback">
                          {{ 'wizard.date_location.date_required' | translate }}
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Time Periods -->
                <div class="card bg-light mb-4">
                  <div class="card-header bg-transparent">
                    <h6 class="mb-0">{{ 'wizard.date_location.time_periods' | translate }}</h6>
                    <small class="text-muted">{{ 'wizard.date_location.time_periods_subtitle' | translate }}</small>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <!-- Morning -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold">
                            <i class="ri-sun-line me-1 text-warning"></i>
                            {{ 'wizard.date_location.morning' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="morningFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.till' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="morningTill">
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Midday -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold">
                            <i class="ri-sun-fill me-1 text-warning"></i>
                            {{ 'wizard.date_location.midday' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="middayFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.till' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="middayTill">
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Evening -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold">
                            <i class="ri-moon-line me-1 text-info"></i>
                            {{ 'wizard.date_location.evening' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="eveningFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_location.till' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="eveningTill">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      [disabled]="wizardService.locationForm.invalid">
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
export class WizardDateLocationComponent implements OnInit {
  private router = inject(Router);
  private publicService = inject(PublicCollectionService);

  wizardService = inject(WizardService);
  availableAreals = signal<ArealCategoryModel[]>([]);

  ngOnInit(): void {
    this.loadAvailableAreals();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.wizardService.locationForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onArealChange(): void {
    const selectedArealId = this.wizardService.locationForm.get('arealId')?.value;
    const selectedAreal = this.availableAreals()
      .flatMap(category => category.areas)
      .find(areal => areal.id === selectedArealId);

    if (selectedAreal) {
      this.wizardService.locationForm.patchValue({
        arealCategoryId: selectedAreal.categoryId
      });
    }
  }

  onNext(): void {
    if (this.wizardService.locationForm.invalid) {
      this.wizardService.locationForm.markAllAsTouched();
      return;
    }

    const formValue = this.wizardService.locationForm.value;
    this.wizardService.updateCollectionData('location', formValue);
    this.wizardService.nextStep();
    this.router.navigate([WIZARD_ROUTES.AMMUNITION]);
  }

  onBack(): void {
    this.wizardService.previousStep();
    this.router.navigate([WIZARD_ROUTES.LOGIN]);
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
}
