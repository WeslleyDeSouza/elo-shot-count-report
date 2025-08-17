import { Component, input, output, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Areal, ArealCategory } from '../areal.model';
import { ArealFacade } from '../areal.facade';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ComponentFormBase, Confirmable } from "@app-galaxy/sdk-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import {ApiProperty} from "@nestjs/swagger";

const PATHS = {
  AREAL_OVERVIEW: '/admin/areal/overview'
} as const;

@Component({
  selector: 'app-areal-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe],
  templateUrl: './areal-form.component.html',
  styleUrls: ['./areal-form.component.scss'],
  providers: [ArealFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArealFormComponent extends ComponentFormBase<Areal> implements OnInit, OnDestroy {
  areal = input<Areal | null>(null);
  mode = input<'create' | 'edit'>('create');
  categoryId = input<string | null>(null);

  formSubmit = output<Areal>();
  formCancel = output<void>();

  private destroy$ = new Subject<void>();
  private facade = inject(ArealFacade);
  private router = inject(Router);
  public override route = inject(ActivatedRoute);

  arealForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  categories = signal<ArealCategory[]>([]);

  isEditMode = computed(() => !!this.getId());
  formTitle = computed(() => this.isEditMode() ? 'Edit Areal' : 'Create New Areal');
  submitButtonText = computed(() => this.isEditMode() ? 'Update Areal' : 'Create Areal');

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
        const category = categories.find(c => c.areas.some(a => a.id === this.getId()));
        const areal = category?.areas.find(a => a.id === this.getId());
        if (areal) {
          this.arealForm.patchValue({
            ...areal
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.arealForm = this.fb.group({
      id: [this.areal()?.id || ''],
      name: [
        this.areal()?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      categoryId: [
        this.areal()?.categoryId || this.categoryId() || '',
        [Validators.required]
      ],
      enabled: [this.areal()?.enabled ?? true]
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
    if (this.arealForm.valid) {
      this.error.set(null);
      const formValue = this.arealForm.getRawValue();

      if (this.getId()) {
        this.updateAreal(this.getId(), formValue);
      } else {
        this.arealForm.removeControl('id');
        const newFormValue = this.arealForm.getRawValue();
        this.createAreal(newFormValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createAreal(formValue: any): void {
    this.facade.createAreal(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(areal => {
        if (areal) {
          this.formSubmit.emit(areal);
          this.resetForm();
          this.router.navigate([PATHS.AREAL_OVERVIEW]);
        }
      });
  }

  private updateAreal(id: string, formValue: any): void {
    this.facade.updateAreal(id, {

      arealId : formValue.arealId,

      categoryId :formValue.categoryId,

      name :formValue .name,

      enabled :formValue.enabled,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(areal => {
        if (areal) {
          this.formSubmit.emit(areal);
          this.router.navigate([PATHS.AREAL_OVERVIEW]);
        }
      });
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
    this.router.navigate([PATHS.AREAL_OVERVIEW]);
  }

  @Confirmable({ title: "Are you sure you want to delete this areal?" })
  onDelete() {
    firstValueFrom(this.facade.deleteAreal(this.getId()))
      .then(() => this.onCancel());
  }

  private resetForm(): void {
    this.arealForm.reset();
    this.error.set(null);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.arealForm.controls).forEach(key => {
      const control = this.arealForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.arealForm.get(fieldName);
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
      name: 'Areal Name',
      categoryId: 'Category'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.arealForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  clearError(): void {
    this.error.set(null);
    this.facade.clearError();
  }

  private handleQueryParams(): void {
    const categoryId = this.route.snapshot.queryParams['categoryId'];
    if (categoryId && !this.isEditMode()) {
      this.arealForm.patchValue({ categoryId });
    }
  }
}
