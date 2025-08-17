import {Component, signal, inject, OnInit, OnDestroy, ChangeDetectionStrategy, input, output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Collection } from '../collection.model';
import { CollectionFacade } from '../collection.facade';

@Component({
  selector: 'app-collection-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  template: `
    <div class="container-fluid">
      <form [formGroup]="form" (ngSubmit)="onSave()">
        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">{{ 'admin.collection.form.name' | translate }}</label>
            <input type="text" class="form-control" formControlName="name" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">{{ 'admin.collection.form.responsible' | translate }}</label>
            <input type="text" class="form-control" formControlName="responsible" required>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label class="form-label">{{ 'admin.collection.form.unit' | translate }}</label>
            <input type="text" class="form-control" formControlName="unit" required>
          </div>
          <div class="col-md-6">
            <label class="form-label">{{ 'admin.collection.form.pin' | translate }}</label>
            <input type="text" class="form-control" formControlName="pin" required>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-12">
            <label class="form-label">{{ 'admin.collection.form.user_type' | translate }}</label>
            <div class="btn-group" role="group">
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

        <hr>

        <div class="row mb-3">
          <div class="col-12">
            <h5>{{ 'admin.collection.form.weapons' | translate }}</h5>
            <div formArrayName="weapons">
              @for(weaponControl of weaponsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="row mb-2">
                  <div class="col-md-8">
                    <label class="form-label">{{ getWeaponLabel(i) }}</label>
                  </div>
                  <div class="col-md-4">
                    <input type="number" class="form-control" formControlName="count" min="0">
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            {{ 'admin.common.cancel' | translate }}
          </button>
          @if(collection()?.id) {
            <button type="button" class="btn btn-danger" (click)="onDelete()">
              {{ 'admin.common.delete' | translate }}
            </button>
          }
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading()">
            {{ 'admin.common.save' | translate }}
          </button>
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
  `
})
export class CollectionFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private formBuilder = inject(FormBuilder);
  private facade = inject(CollectionFacade);

  collection = input<Collection | null>(null);
  cancel = output<void>();
  save = output<Collection>();

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.initializeForm();
    this.setupFacadeSubscriptions();
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

  private initializeForm(): void {
    const coll = this.collection();
    const personData = coll?.personData;
    const weaponsData = coll?.weaponsData || {};

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
      weapons: this.formBuilder.array(weaponsArray)
    });
  }

  get weaponsArray(): FormArray {
    return this.form.get('weapons') as FormArray;
  }

  getWeaponLabel(index: number): string {
    const weaponControl = this.weaponsArray.at(index);
    const weaponId = weaponControl?.get('id')?.value;
    return `Weapon ${weaponId}`;
  }

  onSave(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const collection = this.collection();
      
      const data = {
        ...collection,
        pin: formValue.pin,
        userType: formValue.userType,
        person: JSON.stringify({
          name: formValue.name,
          responsible: formValue.responsible,
          unit: formValue.unit,
          pin: formValue.pin
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