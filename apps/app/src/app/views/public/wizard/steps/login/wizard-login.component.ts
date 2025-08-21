import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicCollectionService } from '@ui-elo/apiClient';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

@Component({
  selector: 'app-wizard-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid min-vh-100 d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Header -->
              <div class="text-center mb-4">
                <h2 class="h4 mb-2">{{ 'wizard.login.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.login.subtitle' | translate }}</p>
              </div>

              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 20%"></div>
              </div>

              <!-- Form -->
              <form [formGroup]="wizardService.personalForm" (ngSubmit)="onNext()">
                <!-- Name -->
                <div class="mb-3">
                  <label class="form-label">
                    {{ 'wizard.login.name' | translate }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="name"
                    [class.is-invalid]="isFieldInvalid('name')"
                    placeholder="{{ 'wizard.login.name_placeholder' | translate }}">
                  @if(isFieldInvalid('name')) {
                    <div class="invalid-feedback">
                      {{ 'wizard.login.name_required' | translate }}
                    </div>
                  }
                </div>

                <!-- PIN -->
                <div class="mb-3">
                  <label class="form-label">
                    {{ 'wizard.login.pin' | translate }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    formControlName="pin"
                    [class.is-invalid]="isFieldInvalid('pin') || pinError()"
                    placeholder="{{ 'wizard.login.pin_placeholder' | translate }}">
                  @if(isFieldInvalid('pin')) {
                    <div class="invalid-feedback">
                      {{ 'wizard.login.pin_required' | translate }}
                    </div>
                  }
                  @if(pinError()) {
                    <div class="invalid-feedback d-block">
                      {{ 'wizard.login.pin_invalid' | translate }}
                    </div>
                  }
                </div>

                <!-- Responsible -->
                <div class="mb-3">
                  <label class="form-label">
                    {{ 'wizard.login.responsible' | translate }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="responsible"
                    [class.is-invalid]="isFieldInvalid('responsible')"
                    placeholder="{{ 'wizard.login.responsible_placeholder' | translate }}">
                  @if(isFieldInvalid('responsible')) {
                    <div class="invalid-feedback">
                      {{ 'wizard.login.responsible_required' | translate }}
                    </div>
                  }
                </div>

                <!-- Unit -->
                <div class="mb-3">
                  <label class="form-label">
                    {{ 'wizard.login.unit' | translate }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    formControlName="unit"
                    [class.is-invalid]="isFieldInvalid('unit')"
                    placeholder="{{ 'wizard.login.unit_placeholder' | translate }}">
                  @if(isFieldInvalid('unit')) {
                    <div class="invalid-feedback">
                      {{ 'wizard.login.unit_required' | translate }}
                    </div>
                  }
                </div>

                <!-- Organization/User Type -->
                <div class="mb-4">
                  <label class="form-label">
                    {{ 'wizard.login.organization' | translate }} <span class="text-danger">*</span>
                  </label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="userType" value="M" formControlName="userType" id="userType-M">
                    <label class="btn btn-outline-primary" for="userType-M">{{ 'wizard.login.army' | translate }}</label>

                    <input type="radio" class="btn-check" name="userType" value="B" formControlName="userType" id="userType-B">
                    <label class="btn btn-outline-primary" for="userType-B">{{ 'wizard.login.bl' | translate }}</label>

                    <input type="radio" class="btn-check" name="userType" value="S" formControlName="userType" id="userType-S">
                    <label class="btn btn-outline-primary" for="userType-S">SAT</label>

                    <input type="radio" class="btn-check" name="userType" value="Z" formControlName="userType" id="userType-Z">
                    <label class="btn btn-outline-primary" for="userType-Z">{{ 'wizard.login.zv' | translate }}</label>
                  </div>
                </div>

                <!-- Actions -->
                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="wizardService.personalForm.invalid || loading()">
                    @if(loading()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    }
                    <i class="ri-arrow-right-line me-1"></i>
                    {{ 'wizard.common.next' | translate }}
                  </button>
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
export class WizardLoginComponent {
  private router = inject(Router);
  private publicService = inject(
    PublicCollectionService
  );

  wizardService = inject(WizardService);
  loading = signal(false);
  pinError = signal(false);


  isFieldInvalid(fieldName: string): boolean {
    const field = this.wizardService.personalForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  async onNext(): Promise<void> {
    if (this.wizardService.personalForm.invalid) {
      this.wizardService.personalForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.pinError.set(false);

    try {
      const formValue = this.wizardService.personalForm.value;
      const isValidPin = await this.verifyPin(formValue.pin!);

      if (isValidPin) {
        this.wizardService.updateCollectionData('personal', formValue);
        this.wizardService.nextStep();
        this.router.navigate([WIZARD_ROUTES.DATE_LOCATION]);
      } else {
        this.pinError.set(true);
      }
    } catch (error) {
      this.pinError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  private async verifyPin(pin: string): Promise<boolean> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      const response = await firstValueFrom(
        this.publicService.publicCollectionVerifyPin({ identifier, cordNumber: pin })
      );

      if (response?.result) {
        const rule = await firstValueFrom(
          this.publicService.publicCollectionGetCoordinationByPin({ identifier, cordNumber: pin })
        );
        return !!rule;
      }
      return false;
    } catch {
      return false;
    }
  }
}
