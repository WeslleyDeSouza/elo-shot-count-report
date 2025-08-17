import { Component, input, output, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeaponCategory } from '../weapon.model';
import { WeaponFacade } from '../weapon.facade';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ComponentFormBase, Confirmable } from "@app-galaxy/sdk-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';

const PATHS = {
  WEAPON_OVERVIEW: '/admin/weapon/overview'
} as const;

@Component({
  selector: 'app-weapon-category-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './weapon-category-form.component.html',
  styleUrls: ['./weapon-category-form.component.scss'],
  providers: [WeaponFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeaponCategoryFormComponent extends ComponentFormBase<WeaponCategory> implements OnInit, OnDestroy {
  category = input<WeaponCategory | null>(null);
  mode = input<'create' | 'edit'>('create');

  formSubmit = output<WeaponCategory>();
  formCancel = output<void>();

  private destroy$ = new Subject<void>();
  private facade = inject(WeaponFacade);
  private router = inject(Router);

  categoryForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  isEditMode = computed(() => !!this.getId());
  formTitle = computed(() => this.isEditMode() ? 'admin.weapon.form.edit_weapon_category' : 'admin.weapon.form.create_new_weapon_category');
  submitButtonText = computed(() => this.isEditMode() ? 'admin.weapon.form.update_category' : 'admin.weapon.form.create_category');

  ngOnInit(): void {
    this.initializeForm();
    this.setupFacadeSubscriptions();
  }

  override getData(): void {
    if (!this.getId()) return;

    firstValueFrom(this.facade.loadCategories())
      .then(categories => {
        const category = categories.find(c => c.id === this.getId());
        if (category) {
          this.categoryForm.patchValue({
            ...category
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.categoryForm = this.fb.group({
      id: [this.category()?.id || ''],
      name: [
        this.category()?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      code: [
        this.category()?.code || '',
        [Validators.required, Validators.min(1), Validators.max(999)]
      ]
    });

    if (this.isEditMode()) {
      this.categoryForm.get('code')?.disable();
    }
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
    if (this.categoryForm.valid) {
      this.error.set(null);
      const formValue = this.categoryForm.getRawValue();

      if (this.getId()) {
        this.updateCategory(this.getId(), formValue);
      } else {
        this.categoryForm.removeControl('id');
        const newFormValue = this.categoryForm.getRawValue();
        this.createCategory(newFormValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createCategory(formValue: any): void {
    this.facade.createWeaponCategory(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(category => {
        if (category) {
          this.formSubmit.emit(category);
          this.resetForm();
          this.router.navigate([PATHS.WEAPON_OVERVIEW]);
        }
      });
  }

  private updateCategory(id: string, formValue: any): void {
    this.facade.updateWeaponCategory(id, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(category => {
        if (category) {
          this.formSubmit.emit(category);
          this.router.navigate([PATHS.WEAPON_OVERVIEW]);
        }
      });
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
    this.router.navigate([PATHS.WEAPON_OVERVIEW]);
  }

  @Confirmable({ title: "Are you sure you want to delete this category?" })
  onDelete() {
    firstValueFrom(this.facade.deleteWeaponCategory(this.getId()))
      .then(() => this.onCancel());
  }

  private resetForm(): void {
    this.categoryForm.reset();
    this.error.set(null);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.categoryForm.get(fieldName);
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
      if (control.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['max'].max}`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Category Name',
      code: 'Category Code'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoryForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  clearError(): void {
    this.error.set(null);
    this.facade.clearError();
  }
}