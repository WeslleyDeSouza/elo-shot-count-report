import { Component, input, output, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CoordinationOffice } from '../coordination-office.model';
import { CoordinationOfficeFacade } from '../coordination-office.facade';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { ComponentFormBase, Confirmable } from "@app-galaxy/sdk-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { UserAssignmentComponent } from './user-assignment.component';

@Component({
  selector: 'app-coordination-office-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, UserAssignmentComponent],
  templateUrl: './coordination-office-form.component.html',
  styleUrls: ['./coordination-office-form.component.scss'],
  providers: [CoordinationOfficeFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoordinationOfficeFormComponent extends ComponentFormBase<CoordinationOffice> implements OnInit, OnDestroy {
  coordinationOffice = input<CoordinationOffice | null>(null);
  mode = input<'create' | 'edit'>('create');

  formSubmit = output<CoordinationOffice>();
  formCancel = output<void>();

  private destroy$ = new Subject<void>();
  private facade = inject(CoordinationOfficeFacade);
  private router = inject(Router);
  public override route = inject(ActivatedRoute);

  coordinationOfficeForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  isEditMode = computed(() => !!this.getId());
  formTitle = computed(() => this.isEditMode() ? 'admin.coordination_office.form.edit_coordination_office' : 'admin.coordination_office.form.create_new_coordination_office');
  submitButtonText = computed(() => this.isEditMode() ? 'admin.coordination_office.form.update_office' : 'admin.coordination_office.form.create_office');

  ngOnInit(): void {
    this.initializeForm();
    this.setupFacadeSubscriptions();
    this.getData();
  }

  override getData(): void {
    if (!this.getId()) return;

    this.loading.set(true);
    firstValueFrom(this.facade.loadCoordinationOffices())
      .then(offices => {
        const office = offices.find(o => o.id === this.getId());
        if (office) {
          this.coordinationOfficeForm.patchValue({
            ...office
          });
        }
      })
      .finally(() => this.loading.set(false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.coordinationOfficeForm = this.fb.group({
      id: [this.coordinationOffice()?.id || ''],
      name: [
        this.coordinationOffice()?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(25)]
      ],
      email: [
        this.coordinationOffice()?.email || '',
        [Validators.required, Validators.email, Validators.maxLength(100)]
      ],
      pin: [
        this.coordinationOffice()?.pin || '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(15)]
      ],
      allowedArealNames: [
        this.coordinationOffice()?.allowedArealNames || '',
        [Validators.maxLength(100)]
      ],
      enabled: [this.coordinationOffice()?.enabled ?? true]
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
    if (this.coordinationOfficeForm.valid) {
      this.error.set(null);
      const formValue = this.coordinationOfficeForm.getRawValue();

      if (this.getId()) {
        this.updateCoordinationOffice(this.getId(), formValue);
      } else {
        this.coordinationOfficeForm.removeControl('id');
        const newFormValue = this.coordinationOfficeForm.getRawValue();
        this.createCoordinationOffice(newFormValue);
      }
    } else {
      this.markFormGroupTouched();
      console.log(this.coordinationOfficeForm);
    }
  }

  private createCoordinationOffice(formValue: any): void {
    formValue.enabled = !!formValue.enabled
    this.facade.createCoordinationOffice(formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(office => {
        if (office) {
          this.formSubmit.emit(office);
          this.resetForm();
          this.router.navigate(['/admin/coordination-office']);
        }
      });
  }

  private updateCoordinationOffice(id: string, formValue: any): void {
    formValue.enabled = !!formValue.enabled
    this.facade.updateCoordinationOffice(id, formValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe(office => {
        if (office) {
          this.formSubmit.emit(office);
          this.router.navigate(['/admin/coordination-office']);
        }
      });
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
    this.router.navigate(['/admin/coordination-office']);
  }

  @Confirmable({ title: "Are you sure you want to delete this coordination office?" })
  onDelete() {
    firstValueFrom(this.facade.deleteCoordinationOffice(this.getId()))
      .then(() => this.onCancel());
  }

  private resetForm(): void {
    this.coordinationOfficeForm.reset();
    this.error.set(null);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.coordinationOfficeForm.controls).forEach(key => {
      const control = this.coordinationOfficeForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.coordinationOfficeForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['email']) {
        return `${this.getFieldLabel(fieldName)} must be a valid email address`;
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
      name: 'Office Name',
      email: 'Email Address',
      pin: 'PIN',
      allowedArealNames: 'Allowed Areals'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.coordinationOfficeForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  clearError(): void {
    this.error.set(null);
    this.facade.clearError();
  }
}
