import { Component, input, output, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Weapon, WeaponCategory } from '../weapon.model';
import { WeaponFacade } from '../weapon.facade';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ComponentFormBase, Confirmable } from "@app-galaxy/sdk-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';

const PATHS = {
  WEAPON_OVERVIEW: '/admin/weapon/overview'
} as const;

@Component({
  selector: 'app-weapon-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './weapon-form.component.html',
  styleUrls: ['./weapon-form.component.scss'],
  providers: [WeaponFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeaponFormComponent extends ComponentFormBase<Weapon> implements OnInit, OnDestroy {
  weapon = input<Weapon | null>(null);
  mode = input<'create' | 'edit'>('create');
  categoryId = input<string | null>(null);

  formSubmit = output<Weapon>();
  formCancel = output<void>();

  private destroy$ = new Subject<void>();
  private facade = inject(WeaponFacade);
  private router = inject(Router);
  public override route = inject(ActivatedRoute);

  weaponForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  categories = signal<WeaponCategory[]>([]);

  isEditMode = computed(() => !!this.getId());
  formTitle = computed(() => this.isEditMode() ? 'admin.weapon.form.edit_weapon' : 'admin.weapon.form.create_new_weapon');
  submitButtonText = computed(() => this.isEditMode() ? 'admin.weapon.form.update_weapon' : 'admin.weapon.form.create_weapon');

  ngOnInit(): void {
    this.initializeForm();
    this.setupFacadeSubscriptions();
    this.loadCategories();
    this.handleQueryParams();
  }

  override getData(): void {
    if (!this.getId()) return;

    firstValueFrom(this.facade.loadCategories())
      .then(categories => {
        const category = categories.find(c => c.weapons.some(w => w.id === this.getId()));
        const weapon = category?.weapons.find(w => w.id === this.getId());
        if (weapon) {
          this.weaponForm.patchValue({
            ...weapon
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.weaponForm = this.fb.group({
      id: [this.weapon()?.id || ''],
      name: [
        this.weapon()?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      nameDe: [this.weapon()?.nameDe || ''],
      nameFr: [this.weapon()?.nameFr || ''],
      nameIt: [this.weapon()?.nameIt || ''],
      categoryId: [
        this.weapon()?.categoryId || this.categoryId() || '',
        [Validators.required]
      ],
      enabled: [this.weapon()?.enabled ?? true],
      inWeight: [this.weapon()?.inWeight ?? false]
    });
  }

  private loadCategories(): void {
    this.facade.loadCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories.set(categories);
      });
  }

  private setupFacadeSubscriptions(): void {
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  onSubmit(): void {
    if (this.weaponForm.valid) {
      this.error.set(null);
      const formValue = this.weaponForm.getRawValue();

      if (this.getId()) {
        this.updateWeapon(this.getId(), formValue);
      } else {
        this.weaponForm.removeControl('id');
        const newFormValue = this.weaponForm.getRawValue();
        this.createWeapon(newFormValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createWeapon(formValue: any): void {
    this.facade.createWeapon(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(weapon => {
        if (weapon) {
          this.formSubmit.emit(weapon);
          this.resetForm();
          this.router.navigate([PATHS.WEAPON_OVERVIEW]);
        }
      });
  }

  private updateWeapon(id: string, formValue: any): void {
    this.facade.updateWeapon(id, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(weapon => {
        if (weapon) {
          this.formSubmit.emit(weapon);
          this.router.navigate([PATHS.WEAPON_OVERVIEW]);
        }
      });
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
    this.router.navigate([PATHS.WEAPON_OVERVIEW]);
  }

  @Confirmable({ title: "Are you sure you want to delete this weapon?" })
  onDelete() {
    firstValueFrom(this.facade.deleteWeapon(this.getId()))
      .then(() => this.onCancel());
  }

  private resetForm(): void {
    this.weaponForm.reset();
    this.error.set(null);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.weaponForm.controls).forEach(key => {
      const control = this.weaponForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.weaponForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Weapon Name',
      categoryId: 'Category',
      nameDe: 'German Name',
      nameFr: 'French Name',
      nameIt: 'Italian Name'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.weaponForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  clearError(): void {
    this.error.set(null);
    this.facade.clearError();
  }

  private handleQueryParams(): void {
    const categoryId = this.route.snapshot.queryParams['categoryId'];
    if (categoryId && !this.isEditMode()) {
      this.weaponForm.patchValue({ categoryId });
    }
  }
}