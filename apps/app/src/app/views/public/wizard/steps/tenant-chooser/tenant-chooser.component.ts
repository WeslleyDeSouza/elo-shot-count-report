import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicCollectionService, PublicTenantListDto } from '@ui-elo/apiClient';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

@Component({
  selector: 'app-tenant-chooser',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
                <h2 class="h4 mb-2">{{ 'wizard.tenant.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.tenant.subtitle' | translate }}</p>
              </div>

              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 10%"></div>
              </div>

              <!-- Loading State -->
              @if(loading()) {
                <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2 text-muted">{{ 'wizard.tenant.loading' | translate }}</p>
                </div>
              }

              <!-- Error State -->
              @if(error()) {
                <div class="alert alert-danger" role="alert">
                  <i class="ri-error-warning-line me-2"></i>
                  {{ 'wizard.tenant.error' | translate }}
                  <button type="button" class="btn btn-sm btn-outline-danger mt-2" (click)="loadTenants()">
                    {{ 'wizard.tenant.retry' | translate }}
                  </button>
                </div>
              }

              <!-- Tenants List -->
              @if(!loading() && !error() && tenants().length > 0) {
                <div class="row g-3">
                  @for(tenant of tenants(); track tenant.identifier) {
                    <div class="col-12">
                      <div class="card border-2 tenant-card" (click)="selectTenant(tenant.identifier || tenant.tenantName)" style="cursor: pointer; transition: all 0.2s;">
                        <div class="card-body p-3">
                          <div class="d-flex align-items-center">
                            <div class="flex-grow-1">
                              <h5 class="card-title mb-0">{{ tenant.tenantName }}</h5>
                              <small class="text-muted">{{ tenant.identifier }}</small>
                            </div>
                            <i class="ri-arrow-right-line text-primary"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Empty State -->
              @if(!loading() && !error() && tenants().length === 0) {
                <div class="text-center py-4">
                  <i class="ri-building-line display-1 text-muted"></i>
                  <p class="mt-2 text-muted">{{ 'wizard.tenant.empty' | translate }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenant-card:hover {
      border-color: var(--bs-primary) !important;
      box-shadow: 0 0.5rem 1rem rgba(0, 123, 255, 0.15) !important;
    }
  `]
})
export class TenantChooserComponent implements OnInit {
  private router = inject(Router);
  private publicService = inject(PublicCollectionService);
  protected wizardService = inject(WizardService);

  tenants = signal<PublicTenantListDto[]>([]);
  loading = signal(false);
  error = signal(false);

  ngOnInit(): void {
    this.loadTenants();
  }

  async loadTenants(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);

    try {
      const response = await firstValueFrom(
        this.publicService.publicCollectionTenantsList()
      );
      this.tenants.set(response || []);
    } catch (error) {
      console.error('Failed to load tenants:', error);
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  selectTenant(identifier: string): void {
    this.wizardService.setTenantIdentifier(identifier);
    this.router.navigate([WIZARD_ROUTES.LOGIN]);
  }
}
