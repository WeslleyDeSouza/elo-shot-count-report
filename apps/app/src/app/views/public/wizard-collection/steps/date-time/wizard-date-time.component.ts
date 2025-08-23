import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

@Component({
  selector: 'app-wizard-date-time',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="h4 mb-2">{{ 'wizard.date_time.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.date_time.subtitle' | translate }}</p>
              </div>

              <!-- Form -->
              <form [formGroup]="wizardService.dateTimeForm" (ngSubmit)="onNext()">
                <!-- Date -->
                <div class="row justify-content-center mb-4">
                  <div class="col-md-6">
                    <div class="mb-4">
                      <label class="form-label h5 text-center w-100">
                        <i class="ri-calendar-line me-2"></i>
                        {{ 'wizard.date_time.date' | translate }} <span class="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        class="form-control form-control-lg text-center"
                        formControlName="date"
                        [class.is-invalid]="isFieldInvalid('date')">
                      @if(isFieldInvalid('date')) {
                        <div class="invalid-feedback text-center">
                          {{ 'wizard.date_time.date_required' | translate }}
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Time Periods -->
                <div class="card bg-light mb-4">
                  <div class="card-header bg-transparent">
                    <h6 class="mb-0 text-center">
                      <i class="ri-time-line me-2"></i>
                      {{ 'wizard.date_time.time_periods' | translate }}
                    </h6>
                    <small class="text-muted text-center d-block">{{ 'wizard.date_time.time_periods_subtitle' | translate }}</small>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <!-- Morning -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold text-center d-block">
                            <i class="ri-sun-line me-1 text-warning"></i>
                            {{ 'wizard.date_time.morning' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="morningFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.till' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="morningTill">
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Midday -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold text-center d-block">
                            <i class="ri-sun-fill me-1 text-warning"></i>
                            {{ 'wizard.date_time.midday' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="middayFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.till' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="middayTill">
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Evening -->
                      <div class="col-md-4">
                        <div class="mb-3">
                          <label class="form-label fw-semibold text-center d-block">
                            <i class="ri-moon-line me-1 text-info"></i>
                            {{ 'wizard.date_time.evening' | translate }}
                          </label>
                          <div class="row">
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.from' | translate }}</label>
                              <input type="time" class="form-control form-control-sm" formControlName="eveningFrom">
                            </div>
                            <div class="col-6">
                              <label class="form-label small">{{ 'wizard.date_time.till' | translate }}</label>
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
                      [disabled]="wizardService.dateTimeForm.invalid">
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
    .form-control-lg {
      font-size: 1.25rem;
      padding: 0.75rem 1rem;
    }

    .card-header {
      border-bottom: 1px solid rgba(0,0,0,.125);
    }
  `]
})
export class WizardDateTimeComponent implements OnInit {
  private router = inject(Router);
  wizardService = inject(WizardService);

  ngOnInit(): void {
    // Initialize form if needed
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.wizardService.dateTimeForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onNext(): void {
    if (this.wizardService.dateTimeForm.invalid) {
      this.wizardService.dateTimeForm.markAllAsTouched();
      return;
    }

    const formValue = this.wizardService.dateTimeForm.value;
    this.wizardService.updateCollectionData('dateTime', formValue);
    this.wizardService.nextStep();
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.LOCATIONS]);
  }

  onBack(): void {
    this.wizardService.previousStep();
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.LOGIN]);
  }
}
