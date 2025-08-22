import { Injectable, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface LocationData {
  arealId: string;
  arealCategoryId: string;
  weapons: { [weaponId: string]: number };
}

export interface Collection {
  personal: {
    name: string;
    pin: string;
    responsible: string;
    unit: string;
    userType: string;
  };
  dateTime: {
    date: string;
    morningFrom?: string;
    morningTill?: string;
    middayFrom?: string;
    middayTill?: string;
    eveningFrom?: string;
    eveningTill?: string;
  };
  locations: LocationData[];
  // Legacy support - will be removed
  location?: {
    arealId: string;
    arealCategoryId: string;
    date: string;
    morningFrom?: string;
    morningTill?: string;
    middayFrom?: string;
    middayTill?: string;
    eveningFrom?: string;
    eveningTill?: string;
  };
  weapons?: { [weaponId: string]: number };
}

@Injectable()
export class WizardService {
  private formBuilder = inject(FormBuilder);

  collectionData = signal<Partial<Collection>>({});
  currentStep = signal(0);
  tenantSelectionValue = signal<string>(''); // identifier

  personalForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    pin: ['', [Validators.required]],
    responsible: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    userType: ['M', [Validators.required]]
  });

  dateTimeForm = this.formBuilder.group({
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    morningFrom: [''],
    morningTill: [''],
    middayFrom: [''],
    middayTill: [''],
    eveningFrom: [''],
    eveningTill: ['']
  });

  // Legacy forms - will be removed
  locationForm = this.formBuilder.group({
    arealId: ['', [Validators.required]],
    arealCategoryId: [''],
    date: [new Date().toISOString().split('T')[0], [Validators.required]],
    morningFrom: [''],
    morningTill: [''],
    middayFrom: [''],
    middayTill: [''],
    eveningFrom: [''],
    eveningTill: ['']
  });

  weaponsForm = this.formBuilder.group({
    weapons: this.formBuilder.array([])
  });

  updateCollectionData(step: keyof Collection, data: any): void {
    const current = this.collectionData();
    this.collectionData.set({
      ...current,
      [step]: data
    });
  }

  getCollectionData(): Partial<Collection> {
    return this.collectionData();
  }

  setTenantIdentifier(identifier: string): void {
    this.tenantSelectionValue.set(identifier);
  }

  getTenantIdentifier(): string {
    return this.tenantSelectionValue();
  }

  resetWizard(): void {
    this.collectionData.set({});
    this.currentStep.set(0);
    this.tenantSelectionValue.set('');
    this.personalForm.reset();
    this.dateTimeForm.reset();
    // Legacy support
    this.locationForm.reset();
    this.weaponsForm.reset();
  }

  nextStep(): void {
    this.currentStep.update(step => Math.min(step + 1, 4));
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 0));
  }
}
