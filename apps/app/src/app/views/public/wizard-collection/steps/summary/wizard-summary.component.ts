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
    <div class="container-fluid d-flex align-items-center">
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
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="ri-user-line me-2"></i>
                    {{ 'wizard.summary.personal_info' | translate }}
                  </h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-light"
                    (click)="editPersonalInfo()"
                    title="{{ 'wizard.common.edit' | translate }}">
                    <i class="ri-edit-line"></i>
                  </button>
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

              <!-- Date and Time -->
              <div class="card mb-3">
                <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    <i class="ri-calendar-line me-2"></i>
                    {{ 'wizard.summary.date_time' | translate }}
                  </h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-light"
                    (click)="editDateTime()"
                    title="{{ 'wizard.common.edit' | translate }}">
                    <i class="ri-edit-line"></i>
                  </button>
                </div>
                <div class="card-body">
                  <div class="mb-2">
                    <strong>{{ 'wizard.summary.date' | translate }}:</strong>
                    <span class="ms-2">{{ formatDate(collectionData().dateTime?.date || collectionData().location?.date) }}</span>
                  </div>

                  <!-- Time Periods -->
                  @if(hasTimePeriods()) {
                    <hr>
                    <div class="row">
                      @if(getTimeFrom('morning') || getTimeTill('morning')) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-sun-line text-warning"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.morning' | translate }}</div>
                            <div class="small">{{ getTimeFrom('morning') }} - {{ getTimeTill('morning') }}</div>
                          </div>
                        </div>
                      }
                      @if(getTimeFrom('midday') || getTimeTill('midday')) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-sun-fill text-warning"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.midday' | translate }}</div>
                            <div class="small">{{ getTimeFrom('midday') }} - {{ getTimeTill('midday') }}</div>
                          </div>
                        </div>
                      }
                      @if(getTimeFrom('evening') || getTimeTill('evening')) {
                        <div class="col-md-4">
                          <div class="text-center p-2 bg-light rounded">
                            <i class="ri-moon-line text-info"></i>
                            <div class="small fw-semibold">{{ 'wizard.summary.evening' | translate }}</div>
                            <div class="small">{{ getTimeFrom('evening') }} - {{ getTimeTill('evening') }}</div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Locations and Weapons -->
              @if(getLocationsList().length > 0) {
                @for(location of getLocationsList(); track location.arealId; let i = $index) {
                  <div class="card mb-3">
                    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">
                        <i class="ri-map-pin-line me-2"></i>
                        {{ 'wizard.summary.location' | translate }} {{ i + 1 }}: {{ location.arealName }}
                      </h6>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-light"
                        (click)="editLocations()"
                        title="{{ 'wizard.common.edit' | translate }}">
                        <i class="ri-edit-line"></i>
                      </button>
                    </div>
                    <div class="card-body">
                      @if(location.weaponsList.length > 0) {
                        <div class="table-responsive">
                          <table class="table table-sm mb-0">
                            <thead>
                              <tr>
                                <th>{{ 'wizard.summary.weapon_name' | translate }}</th>
                                <th class="text-end">{{ 'wizard.summary.count' | translate }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for(weapon of location.weaponsList; track weapon.id) {
                                <tr>
                                  <td>
                                    <i class="ri-sword-line me-2 text-muted"></i>
                                    {{ weapon.name }}
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
                }
              } @else {
                <!-- Fallback for legacy data -->
                <div class="card mb-4">
                  <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                      <i class="ri-sword-line me-2"></i>
                      {{ 'wizard.summary.weapons' | translate }}
                    </h6>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-light"
                      (click)="editWeapons()"
                      title="{{ 'wizard.common.edit' | translate }}">
                      <i class="ri-edit-line"></i>
                    </button>
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
              }

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
    const dateTime = this.collectionData().dateTime;
    const location = this.collectionData().location; // Legacy support
    return !!(
      dateTime?.morningFrom || dateTime?.morningTill ||
      dateTime?.middayFrom || dateTime?.middayTill ||
      dateTime?.eveningFrom || dateTime?.eveningTill ||
      location?.morningFrom || location?.morningTill ||
      location?.middayFrom || location?.middayTill ||
      location?.eveningFrom || location?.eveningTill
    );
  }

  getTimeFrom(period: 'morning' | 'midday' | 'evening'): string {
    const dateTime = this.collectionData().dateTime;
    const location = this.collectionData().location; // Legacy support
    return dateTime?.[`${period}From`] || location?.[`${period}From`] || '';
  }

  getTimeTill(period: 'morning' | 'midday' | 'evening'): string {
    const dateTime = this.collectionData().dateTime;
    const location = this.collectionData().location; // Legacy support
    return dateTime?.[`${period}Till`] || location?.[`${period}Till`] || '';
  }

  getLocationsList(): any[] {
    const locations = this.collectionData().locations || [];
    return locations.map(location => ({
      arealId: location.arealId,
      arealName: this.getArealNameById(location.arealId),
      weaponsList: this.getWeaponsListForLocation(location)
    }));
  }

  getArealNameById(arealId: string): string {
    const areal = this.availableAreals()
      .flatMap((category: any) => category.areas)
      .find((areal: any) => areal.id === arealId);
    return areal ? areal.name : arealId;
  }

  getWeaponsListForLocation(location: any): any[] {
    const weapons = location.weapons || {};
    return Object.entries(weapons)
      .map(([weaponId, count]: [string, any]) => {
        const weapon = this.availableWeapons().find(w => w.id === weaponId);
        return {
          id: weaponId,
          name: weapon?.name || weaponId,
          count
        };
      })
      .filter(weapon => weapon.count > 0);
  }

  combineAllWeapons(data: any): { [weaponId: string]: number } {
    const combinedWeapons: { [weaponId: string]: number } = {};

    // Handle new structure with locations
    if (data.locations && data.locations.length > 0) {
      data.locations.forEach((location: any) => {
        const weapons = location.weapons || {};
        Object.entries(weapons).forEach(([weaponId, count]: [string, any]) => {
          if (count > 0) {
            combinedWeapons[weaponId] = (combinedWeapons[weaponId] || 0) + count;
          }
        });
      });
    }

    // Handle legacy structure
    if (data.weapons) {
      Object.entries(data.weapons).forEach(([weaponId, count]: [string, any]) => {
        if (count > 0) {
          combinedWeapons[weaponId] = (combinedWeapons[weaponId] || 0) + count;
        }
      });
    }

    return combinedWeapons;
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

      // Support both new and legacy data structures
      const locations = data.locations || [];
      const dateTime = data.dateTime || data.location;

      const submissionData = {
        pin: data.personal?.pin,
        userType: data.personal?.userType,
        person: {
          name: data.personal?.name,
          responsible: data.personal?.responsible,
          unit: data.personal?.unit,
          pin: data.personal?.pin
        },
        date: {
          date: dateTime?.date,
          morning: {
            from: dateTime?.morningFrom || null,
            till: dateTime?.morningTill || null
          },
          midday: {
            from: dateTime?.middayFrom || null,
            till: dateTime?.middayTill || null
          },
          evening: {
            from: dateTime?.eveningFrom || null,
            till: dateTime?.eveningTill || null
          }
        },
        // For multiple locations, we'll submit each location separately or combine weapons
        locations: locations.length > 0 ? locations : undefined,
        // Legacy support - combine all weapons from all locations
        arealId: locations[0]?.arealId || data.location?.arealId,
        arealCategoryId: locations[0]?.arealCategoryId || data.location?.arealCategoryId,
        weapons: this.combineAllWeapons(data)
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
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.LOCATIONS]);
  }

  editPersonalInfo(): void {
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.LOGIN]);
  }

  editDateTime(): void {
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.DATE_TIME]);
  }

  editLocations(): void {
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.LOCATIONS]);
  }

  editWeapons(): void {
    this.router.navigate([WIZARD_ROUTES.BASE, WIZARD_ROUTES.AMMUNITION]);
  }

  private async loadAvailableWeapons(): Promise<void> {
    try {
      const identifier = this.wizardService.getTenantIdentifier();
      const data = this.collectionData();
      const locations = data.locations || [];

      // For new structure, load weapons for all locations
      if (locations.length > 0) {
        const allWeapons: any[] = [];
        for (const location of locations) {
          try {
            const response = await firstValueFrom(
              this.publicService.publicCollectionListWeaponFromAreal({
                identifier,
                arealCategoryId: location.arealCategoryId
              })
            );
            if (response) {
              // Flatten the weapon categories into a simple array
              const weapons = response.flatMap(category =>
                category.weapons?.map(weapon => ({
                  ...weapon,
                  categoryName: category.name
                })) || []
              );
              allWeapons.push(...weapons);
            }
          } catch (error) {
            console.error('Failed to load weapons for location:', location.arealId, error);
          }
        }
        this.availableWeapons.set(allWeapons);
        return;
      }

      // Legacy support
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
