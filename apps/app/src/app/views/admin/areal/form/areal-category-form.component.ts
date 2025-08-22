import { Component, input, output, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArealCategory } from '../areal.model';
import { ArealFacade } from '../areal.facade';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ComponentFormBase, Confirmable } from "@app-galaxy/sdk-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';

@Component({
  selector: 'app-areal-category-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './areal-category-form.component.html',
  styleUrls: ['./areal-category-form.component.scss'],
  providers: [ArealFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArealCategoryFormComponent extends ComponentFormBase<ArealCategory> implements OnInit, OnDestroy {
  category = input<ArealCategory | null>(null);
  mode = input<'create' | 'edit'>('create');

  formSubmit = output<ArealCategory>();
  formCancel = output<void>();

  private destroy$ = new Subject<void>();
  private facade = inject(ArealFacade);
  private router = inject(Router);

  categoryForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  isEditMode = computed(() => !!this.getId());
  formTitle = computed(() => this.isEditMode() ? 'admin.areal.form.edit_areal_category' : 'admin.areal.form.create_new_areal_category');
  submitButtonText = computed(() => this.isEditMode() ? 'admin.areal.form.update_category' : 'admin.areal.form.create_category');
  allowedPrefixes = signal<string[]>([]);

  private categoryCodePrefixValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const isValid = this.facade.validateCategoryCodePrefix(value);
      if (!isValid) {
        const allowedRules = this.facade.getCurrentAllowedRules();
        return { 
          categoryCodePrefix: { 
            value: value,
            allowedPrefixes: allowedRules 
          } 
        };
      }
      return null;
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFacadeSubscriptions();
    this.facade.refreshAllowedRules();
  }

  override getData(): void {


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
    this.categoryForm = new FormGroup({
      id: new FormControl(this.category()?.id || ''),
      name: new FormControl(
        this.category()?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ),
      code: new FormControl(
        this.category()?.code || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Z0-9_-]+$/), this.categoryCodePrefixValidator()]
      )
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

    this.facade.allowedRules$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rules => this.allowedPrefixes.set(rules));
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.error.set(null);
      const formValue = this.categoryForm.getRawValue();

      if (this.getId()) {
        this.updateCategory(this.getId(), formValue);
      } else {
        const createData = {
          name: formValue.name,
          code: formValue.code
        };
        this.createCategory(createData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createCategory(formValue: any): void {
    this.facade.createArealCategory(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category) => {
          if (category) {
            this.formSubmit.emit(category);
            this.resetForm();
            this.router.navigate(['/admin/areal/overview']);
          }
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  private updateCategory(id: string, formValue: any): void {
    this.facade.updateArealCategory(id, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (category) => {
          if (category) {
            this.formSubmit.emit(category);
            this.router.navigate(['/admin/areal/overview']);
          }
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
    this.router.navigate(['/admin/areal/overview']);
  }

  @Confirmable({ title: "Are you sure you want to delete this category?" })
  onDelete() {
    firstValueFrom(this.facade.deleteArealCategory(this.getId()))
      .then(() => this.onCancel());
  }

  private resetForm(): void {
    this.categoryForm.reset({
      id: '',
      name: '',
      code: ''
    });
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
      if (control.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} must contain only uppercase letters, numbers, hyphens, and underscores`;
      }
      if (control.errors['categoryCodePrefix']) {
        const allowedPrefixes = control.errors['categoryCodePrefix'].allowedPrefixes;
        const prefixList = allowedPrefixes.join(', ');
        return `Category code must start with one of the allowed prefixes: ${prefixList}`;
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

  private handleError(error: any): void {
    let errorMessage = 'An unexpected error occurred';

    if (error?.message?.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.code')) {
      errorMessage = 'A category with this code already exists';
    } else if (error?.message?.includes('SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.name')) {
      errorMessage = 'A category with this name already exists';
    }

    this.error.set(errorMessage);
  }
}
