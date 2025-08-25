import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';

@Component({
  selector: 'app-wizard-success',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid d-flex align-items-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-5 text-center">
              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: 100%"></div>
              </div>

              <!-- Success Icon -->
              <div class="mb-4">
                <div class="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                     style="width: 80px; height: 80px;">
                  <i class="ri-check-line text-success" style="font-size: 2.5rem;"></i>
                </div>
              </div>

              <!-- Success Message -->
              <h1 class="h3 mb-3 text-success">{{ 'wizard.success.title' | translate }}</h1>
              <p class="text-muted mb-4 lead">{{ 'wizard.success.message' | translate }}</p>

              <!-- Collection Info -->
              <div class="card bg-light border-0 mb-4">
                <div class="card-body py-3">
                  <div class="row text-start">
                    <div class="col-6">
                      <div class="small text-muted">{{ 'wizard.success.submitted_at' | translate }}</div>
                      <div class="fw-semibold">{{ getCurrentTime() }}</div>
                    </div>
                    <div class="col-6">
                      <div class="small text-muted">{{ 'wizard.success.status' | translate }}</div>
                      <div class="fw-semibold text-success">
                        <i class="ri-check-line me-1"></i>
                        {{ 'wizard.success.completed' | translate }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="alert alert-info border-0 mb-4">
                <i class="ri-information-line me-2"></i>
                {{ 'wizard.success.next_steps' | translate }}
              </div>

              <!-- Actions -->
              <div class="d-flex gap-3 justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  (click)="onNewSubmission()">
                  <i class="ri-add-line me-1"></i>
                  {{ 'wizard.success.new_submission' | translate }}
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  (click)="onGoHome()">
                  <i class="ri-home-line me-1"></i>
                  {{ 'wizard.success.go_home' | translate }}
                </button>
              </div>

              <!-- Footer Note -->
              <div class="mt-4 pt-3 border-top">
                <small class="text-muted">
                  <i class="ri-shield-check-line me-1"></i>
                  {{ 'wizard.success.secure_submission' | translate }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WizardSuccessComponent {
  private router = inject(Router);
  private wizardService = inject(WizardService);

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }

  onNewSubmission(): void {
    this.wizardService.resetWizard();
    this.router.navigate(['/w/login']);
  }

  onGoHome(): void {
    this.wizardService.resetWizard();
    this.router.navigate(['/w']);
  }
}
