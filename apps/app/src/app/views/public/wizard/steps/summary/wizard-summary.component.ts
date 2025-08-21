import { Component, signal, inject, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { WizardService } from '../../_common/services/wizard.service';
import { PublicCollectionService } from '@ui-elo/apiClient';
import { firstValueFrom } from 'rxjs';
import { WIZARD_ROUTES } from '../../wizard.routes.constants';

@Component({
  selector: 'app-wizard-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
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
                <h2 class="h4 mb-2">{{ 'wizard.summary.title' | translate }}</h2>
                <p class="text-muted">{{ 'wizard.summary.subtitle' | translate }}</p>
              </div>

              <!-- Progress Indicator -->
              <div class="progress mb-4" style="height: 4px;">
                <div class="progress-bar" role="progressbar" style="width: 80%"></div>
              </div>

              <!-- Personal Information -->
              <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="ri-user-line me-2"></i>
                    {{ 'wizard.summary.personal_info' | translate }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.name' | translate }}:</strong>
                        <span class="ms-2">{{ collectionData().personal?.name }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.responsible' | translate }}:</strong>
                        <span class="ms-2">{{ collectionData().personal?.responsible }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.unit' | translate }}:</strong>
                        <span class="ms-2">{{ collectionData().personal?.unit }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.organization' | translate }}:</strong>
                        <span class="ms-2">{{ getUserTypeLabel() | translate }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Location and Date -->
              <div class="card mb-3">
                <div class="card-header bg-info text-white">
                  <h6 class="mb-0">
                    <i class="ri-map-pin-line me-2"></i>
                    {{ 'wizard.summary.location_date' | translate }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.areal' | translate }}:</strong>
                        <span class="ms-2">{{ getArealName() }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-2">
                        <strong>{{ 'wizard.summary.date' | translate }}:</strong>
                        <span class="ms-2">{{ formatDate(collectionData().location?.date) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Time Periods -->
                  @if(hasTimePeriods()) {
                    <hr>
                    <div class="row">
                      @if(collectionData().location?.morningFrom || collectionData().location?.morningTill) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-sun-line text-warning"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.morning' | translate }}</div>
                            <div class="small">{{ collectionData().location?.morningFrom }} - {{ collectionData().location?.morningTill }}</div>
                          </div>
                        </div>
                      }
                      @if(collectionData().location?.middayFrom || collectionData().location?.middayTill) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-sun-fill text-warning"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.midday' | translate }}</div>
                            <div class="small">{{ collectionData().location?.middayFrom }} - {{ collectionData().location?.middayTill }}</div>
                          </div>
                        </div>
                      }
                      @if(collectionData().location?.eveningFrom || collectionData().location?.eveningTill) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-moon-line text-info"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.evening' | translate }}</div>
                            <div class="small">{{ collectionData().location?.eveningFrom }} - {{ collectionData().location?.eveningTill }}</div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Weapons -->
              <div class="card mb-4">
                <div class="card-header bg-success text-white">
                  <h6 class="mb-0">
                    <i class="ri-sword-line me-2"></i>
                    {{ 'wizard.summary.weapons' | translate }}
                  </h6>
                </div>
                <div class="card-body">
                  @if(getWeaponsList().length > 0) {
                    <div class="table-responsive">
                      <table class="table table-sm mb-0">
                        <thead>
                          <tr>
                            <th>{{ 'wizard.summary.weapon_name' | translate }}</th>
                            <th class="text-end">{{ 'wizard.summary.count' | translate }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for(weapon of getWeaponsList(); track weapon.id) {
                            <tr>
                              <td>
                                <i class="ri-sword-line me-2 text-muted"></i>
                                {{ weapon.name }} ({{ weapon.categoryName }})
                              </td>
                              <td class="text-end">
                                <span class="badge bg-primary">{{ weapon.count }}</span>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  } @else {
                    <div class="text-muted text-center py-3">
                      {{ 'wizard.summary.no_weapons' | translate }}
                    </div>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="row">
                <div class="col-6">
                  <button
                    type="button"
                    class="btn btn-outline-secondary w-100"
                    (click)="onBack()"
                    [disabled]="submitting()">
                    <i class="ri-arrow-left-line me-1"></i>
                    {{ 'wizard.common.back' | translate }}
                  </button>
                </div>
                <div class="col-6">
                  <button
                    type="button"
                    class="btn btn-primary w-100"
                    (click)="onSubmit()"
                    [disabled]="submitting()">
                    @if(submitting()) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    }
                    <i class="ri-check-line me-1"></i>
                    {{ 'wizard.summary.submit' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WizardSummaryComponent implements OnInit {
  private router = inject(Router);
  private publicService = inject(PublicCollectionService);

  wizardService = inject(WizardService);
  submitting = signal(false);
  availableWeapons = signal<any[]>([]);
  availableAreals = signal<any[]>([]);

  collectionData = computed(() => this.wizardService.getCollectionData());

  ngOnInit(): void {
    this.loadAvailableWeapons();
    this.loadAvailableAreals();
  }

  getUserTypeLabel(): string {
    const userType = this.collectionData().personal?.userType;
    switch (userType) {
      case 'M': return 'wizard.summary.army';
      case 'B': return 'wizard.summary.bl';
      case 'S': return 'SAT';
      case 'Z': return 'wizard.summary.zv';
      default: return userType || '';
    }
  }

  getArealName(): string {
    const arealId = this.collectionData().location?.arealId;
    if (!arealId) return '';

    const areal = this.availableAreals()
      .flatMap((category: any) => category.areas)
      .find((areal: any) => areal.id === arealId);

    return areal ? areal.name : arealId;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  hasTimePeriods(): boolean {
    const location = this.collectionData().location;
    return !!(
      location?.morningFrom || location?.morningTill ||
      location?.middayFrom || location?.middayTill ||
      location?.eveningFrom || location?.eveningTill
    );
  }

  getWeaponsList(): any[] {
    const weapons = this.collectionData().weapons || {};
    return Object.entries(weapons)
      .map(([weaponId, count]) => {
        const weapon = this.availableWeapons().find(w => w.id === weaponId);
        return {
          id: weaponId,
          name: weapon?.name || weaponId,
          categoryName: weapon?.categoryName || '',
          count
        };
      })
      .filter(weapon => weapon.count > 0);
  }

  async onSubmit(): Promise<void> {
    this.submitting.set(true);

    try {
      const data = this.collectionData();

      const submissionData = {
        pin: data.personal?.pin,
        userType: data.personal?.userType,
        arealId: data.location?.arealId,
        arealCategoryId: data.location?.arealCategoryId,
        person: {
          name: data.personal?.name,
          responsible: data.personal?.responsible,
          unit: data.personal?.unit,
          pin: data.personal?.pin
        },
        date: {
          date: data.location?.date,
          morning: {
            from: data.location?.morningFrom || null,
            till: data.location?.morningTill || null
          },
          midday: {
            from: data.location?.middayFrom || null,
            till: data.location?.middayTill || null
          },
          evening: {
            from: data.location?.eveningFrom || null,
            till: data.location?.eveningTill || null
          }
        },
        weapons: data.weapons || {}
      };

      const identifier = this.wizardService.getTenantIdentifier();
      const result = await firstValueFrom(
        this.publicService.publicCollectionCreateCollection({ identifier, body: <any>submissionData })
      );

      if (result) {
        this.wizardService.nextStep();
        this.router.navigate([WIZARD_ROUTES.BASE,WIZARD_ROUTES.SUCCESS]);
      }
    } catch (error) {
      console.error('Error submitting collection:', error);
    } finally {
      this.submitting.set(false);
    }
  }

  onBack(): void {
    this.wizardService.previousStep();
    this.router.navigate([WIZARD_ROUTES.BASE,WIZARD_ROUTES.AMMUNITION]);
  }

  private async loadAvailableWeapons(): Promise<void> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      const selectedArealId = this.wizardService.locationForm.get('arealCategoryId')?.value;

      if (!selectedArealId) {
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
