import {Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy, input, output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Collection } from '../collection.model';
import { CollectionFacade } from '../collection.facade';
import { EmptyStateComponent } from "../../../../components";

@Component({
  selector: 'app-collection-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    EmptyStateComponent
  ],
  template: `
    <div class="container-fluid">
      @if(error()) {
        <div class="alert alert-danger" role="alert">
          {{ error() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSave()">
        <!-- Person Information -->
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">{{ 'admin.collection.form.person_info' | translate }}</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.name' | translate }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="name"
                         [class.is-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
                  @if(form.get('name')?.invalid && form.get('name')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.name_required' | translate }}</div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.responsible' | translate }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="responsible"
                         [class.is-invalid]="form.get('responsible')?.invalid && form.get('responsible')?.touched">
                  @if(form.get('responsible')?.invalid && form.get('responsible')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.responsible_required' | translate }}</div>
                  }
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.unit' | translate }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="unit"
                         [class.is-invalid]="form.get('unit')?.invalid && form.get('unit')?.touched">
                  @if(form.get('unit')?.invalid && form.get('unit')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.unit_required' | translate }}</div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.pin' | translate }} <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" formControlName="pin"
                         [class.is-invalid]="form.get('pin')?.invalid && form.get('pin')?.touched">
                  @if(form.get('pin')?.invalid && form.get('pin')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.pin_required' | translate }}</div>
                  }
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.user_type' | translate }} <span class="text-danger">*</span></label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="userType" value="M" formControlName="userType" id="userType-M">
                    <label class="btn btn-outline-primary" for="userType-M">{{ 'admin.collection.form.army' | translate }}</label>

                    <input type="radio" class="btn-check" name="userType" value="B" formControlName="userType" id="userType-B">
                    <label class="btn btn-outline-primary" for="userType-B">{{ 'admin.collection.form.bl' | translate }}</label>

                    <input type="radio" class="btn-check" name="userType" value="S" formControlName="userType" id="userType-S">
                    <label class="btn btn-outline-primary" for="userType-S">SAT</label>

                    <input type="radio" class="btn-check" name="userType" value="Z" formControlName="userType" id="userType-Z">
                    <label class="btn btn-outline-primary" for="userType-Z">{{ 'admin.collection.form.zv' | translate }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Date Information -->
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">{{ 'admin.collection.form.location_date_info' | translate }}</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.areal' | translate }} <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="arealId" (change)="onArealChange()"
                          [class.is-invalid]="form.get('arealId')?.invalid && form.get('arealId')?.touched">
                    <option value="">{{ 'admin.collection.form.select_areal' | translate }}</option>
                    @for(areal of availableAreals(); track areal.id) {
                      <option [value]="areal.id">{{ areal.name }}</option>
                    }
                  </select>
                  @if(form.get('arealId')?.invalid && form.get('arealId')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.areal_required' | translate }}</div>
                  }
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.date' | translate }} <span class="text-danger">*</span></label>
                  <input type="date" class="form-control" formControlName="date"
                         [class.is-invalid]="form.get('date')?.invalid && form.get('date')?.touched">
                  @if(form.get('date')?.invalid && form.get('date')?.touched) {
                    <div class="invalid-feedback">{{ 'admin.collection.form.date_required' | translate }}</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Periods -->
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">{{ 'admin.collection.form.time_periods' | translate }}</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.morning' | translate }}</label>
                  <div class="row">
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.from' | translate }}</label>
                      <input type="time" class="form-control" formControlName="morningFrom">
                    </div>
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.till' | translate }}</label>
                      <input type="time" class="form-control" formControlName="morningTill">
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.midday' | translate }}</label>
                  <div class="row">
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.from' | translate }}</label>
                      <input type="time" class="form-control" formControlName="middayFrom">
                    </div>
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.till' | translate }}</label>
                      <input type="time" class="form-control" formControlName="middayTill">
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label">{{ 'admin.collection.form.evening' | translate }}</label>
                  <div class="row">
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.from' | translate }}</label>
                      <input type="time" class="form-control" formControlName="eveningFrom">
                    </div>
                    <div class="col-6">
                      <label class="form-label small">{{ 'admin.collection.form.till' | translate }}</label>
                      <input type="time" class="form-control" formControlName="eveningTill">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Weapons -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">{{ 'admin.collection.form.weapons_list' | translate }}</h6>
            <button type="button" class="btn btn-sm btn-primary" (click)="showAddWeaponForm.set(!showAddWeaponForm()) ">
              <i class="ri-add-line"></i> {{ 'admin.collection.form.add_weapon' | translate }}
            </button>
          </div>
          <div class="card-body">
            <!-- Add weapon form -->
            @if(showAddWeaponForm()) {
              <div class="border rounded p-3 mb-3 bg-light">
                <div class="row">
                  <div class="col-md-6">
                    <select class="form-select" [(ngModel)]="selectedWeaponId" [ngModelOptions]="{standalone: true}">
                      <option value="">{{ 'admin.collection.form.select_weapon' | translate }}</option>
                      @for(weapon of getAvailableWeaponsForSelection(); track weapon.id) {
                        <option [value]="weapon.id">{{ weapon.name }} ({{ weapon.categoryName }})</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-4">
                    <input type="number" class="form-control" [(ngModel)]="selectedWeaponCount"
                           [ngModelOptions]="{standalone: true}" min="1" placeholder="{{ 'admin.collection.form.count' | translate }}">
                  </div>
                  <div class="col-md-2">
                    <button type="button" class="btn btn-success w-100" (click)="addWeapon()"
                            [disabled]="!selectedWeaponId || !selectedWeaponCount">
                      <i class="ri-add-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Weapons table -->
            @if(weaponsArray.length > 0) {
              <div class="table-responsive">
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>{{ 'admin.collection.form.weapon_name' | translate }}</th>
                      <th width="120">{{ 'admin.collection.form.count' | translate }}</th>
                      <th width="80">{{ 'admin.common.actions' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody formArrayName="weapons">
                    @for(weaponControl of weaponsArray.controls; track $index; let i = $index) {
                      <tr [formGroupName]="i">
                        <td>{{ getWeaponLabel(i) }}</td>
                        <td>
                          <input type="number" class="form-control form-control-sm" formControlName="count" min="0">
                        </td>
                        <td>
                          <button type="button" class="btn btn-sm btn-danger" (click)="removeWeapon(i)">
                            <i class="ri-delete-bin-line"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <app-empty-state
                [title]="'admin.collection.form.no_weapons' | translate"
                [subtitle]="'admin.collection.form.add_weapons_subtitle' | translate"
                iconClass="ri-sword-line"
                [compact]="true">
                <button type="button" class="btn btn-primary btn-sm" (click)="showAddWeaponForm.set(true)">
                  <i class="ri-add-line"></i> {{ 'admin.collection.form.add_first_weapon' | translate }}
                </button>
              </app-empty-state>
            }
          </div>
        </div>

        <!-- Action buttons -->
        <div class="d-flex justify-content-between">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="loading()">
            <i class="ri-close-line"></i> {{ 'admin.common.cancel' | translate }}
          </button>
          <div class="d-flex gap-2">
            @if(collection()?.id) {
              <button type="button" class="btn btn-danger" (click)="onDelete()" [disabled]="loading()">
                <i class="ri-delete-bin-line"></i> {{ 'admin.common.delete' | translate }}
              </button>
            }
            <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
              @if(loading()) {
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              }
              <i class="ri-save-line"></i> {{ 'admin.common.save' | translate }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: `
    .btn-group .btn-check:checked + .btn {
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
      color: white;
    }

    .form-label.small {
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
  `
})
export class CollectionFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private formBuilder = inject(FormBuilder);
  private facade = inject(CollectionFacade);

  collection = input<Collection | null>(null);
  cancel = output<void>();
  save = output<Collection>();

  selectedWeaponId = signal<string>('');
  selectedWeaponCount = signal<number>(1);
  showAddWeaponForm = signal<boolean>(false);

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  availableWeapons = signal<any[]>([]);
  availableAreals = signal<any[]>([]);
  arealCategories = signal<any[]>([]);

  ngOnInit(): void {
    this.getData()
    this.initializeForm();
    this.setupFacadeSubscriptions();
  }

  getData(){
    this.loadAvailableWeapons();
    this.loadAvailableAreals();
    this.loadArealCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFacadeSubscriptions(): void {
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  private loadAvailableWeapons(): void {
    this.facade.loadWeapons()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        const weapons = categories.flatMap((category: any) =>
          category.weapons.map((weapon: any) => ({
            ...weapon,
            categoryName: category.name
          }))
        );
        this.availableWeapons.set(weapons);
      });
  }

  private loadAvailableAreals(): void {
    this.facade.loadAreal()
      .pipe(takeUntil(this.destroy$))
      .subscribe(areals => {
        this.availableAreals.set(areals);
      });
  }

  private loadArealCategories(): void {
    this.facade.loadArealCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.arealCategories.set(categories);
      });
  }

  private initializeForm(): void {
    const coll = this.collection();
    const personData = coll?.personData;
    const weaponsData = coll?.weaponsData || {};
    const dateData = coll?.dateData;

    const weaponsArray = Object.entries(weaponsData).map(([weaponId, count]) => {
      return this.formBuilder.group({
        id: [weaponId],
        count: [count || 0, [Validators.min(0)]]
      });
    });

    this.form = this.formBuilder.group({
      name: [personData?.name || '', [Validators.required]],
      responsible: [personData?.responsible || '', [Validators.required]],
      unit: [personData?.unit || '', [Validators.required]],
      pin: [coll?.pin || '', [Validators.required]],
      userType: [coll?.userType || 'M', [Validators.required]],
      arealId: [coll?.arealId || '', [Validators.required]],
      date: [dateData?.date || '', [Validators.required]],
      morningFrom: [dateData?.morning?.from || ''],
      morningTill: [dateData?.morning?.till || ''],
      middayFrom: [dateData?.midday?.from || ''],
      middayTill: [dateData?.midday?.till || ''],
      eveningFrom: [dateData?.evening?.from || ''],
      eveningTill: [dateData?.evening?.till || ''],
      weapons: this.formBuilder.array(weaponsArray)
    });
  }

  get weaponsArray(): FormArray {
    return this.form.get('weapons') as FormArray;
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

  onArealChange(): void {
    const selectedArealId = this.form.get('arealId')?.value;
    const selectedAreal = this.availableAreals().find(areal => areal.id === selectedArealId);
    if (selectedAreal) {
      this.form.patchValue({
        arealCategoryId: selectedAreal.arealCategoryId
      });
    }
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

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const collection = this.collection();

      const selectedAreal = this.availableAreals().find(areal => areal.id === formValue.arealId);

      const data = {
        ...collection,
        pin: formValue.pin,
        userType: formValue.userType,
        arealCategoryId: selectedAreal?.arealCategoryId,
        arealId: formValue.arealId,
        person: JSON.stringify({
          name: formValue.name,
          responsible: formValue.responsible,
          unit: formValue.unit,
          pin: formValue.pin
        }),
        date: JSON.stringify({
          date: formValue.date,
          morning: {
            from: formValue.morningFrom || null,
            till: formValue.morningTill || null
          },
          midday: {
            from: formValue.middayFrom || null,
            till: formValue.middayTill || null
          },
          evening: {
            from: formValue.eveningFrom || null,
            till: formValue.eveningTill || null
          }
        }),
        weapons: JSON.stringify(
          formValue.weapons.reduce((acc: any, weapon: any) => {
            acc[weapon.id] = weapon.count;
            return acc;
          }, {})
        )
      };

      if (collection?.id) {
        this.facade.updateCollection(collection.id, data)
          .pipe(takeUntil(this.destroy$))
          .subscribe(result => {
            if (result) {
              this.save.emit(result);
            }
          });
      } else {
        this.facade.createCollection(data)
          .pipe(takeUntil(this.destroy$))
          .subscribe(result => {
            if (result) {
              this.save.emit(result);
            }
          });
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onDelete(): void {
    const collection = this.collection();
    if (collection?.id && confirm(`Are you sure you want to delete this collection?`)) {
      this.facade.deleteCollection(collection.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.cancel.emit();
          }
        });
    }
  }
}
