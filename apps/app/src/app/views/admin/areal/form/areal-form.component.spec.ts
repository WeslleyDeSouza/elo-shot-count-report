import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ArealFormComponent } from './areal-form.component';
import { ArealFacade } from '../areal.facade';
import { Areal, ArealCategory } from '../areal.model';

describe('ArealFormComponent', () => {
  let component: ArealFormComponent;
  let fixture: ComponentFixture<ArealFormComponent>;
  let mockFacade: jest.Mocked<ArealFacade>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockCategory: ArealCategory = {
    id: 'cat1',
    name: 'Test Category',
    code: 'TEST',
    areas: []
  } as ArealCategory;

  const mockAreal: Areal = {
    id: '1',
    name: 'Test Areal',
    categoryId: 'cat1',
    enabled: true
  } as Areal;

  beforeEach(async () => {
    mockFacade = {
      loadCategories: jest.fn(),
      createAreal: jest.fn(),
      updateAreal: jest.fn(),
      deleteAreal: jest.fn(),
      clearError: jest.fn(),
      loading$: of(false),
      error$: of(null)
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;
    
    mockActivatedRoute = {
      snapshot: {
        params: {},
        queryParams: {},
        paramMap: {
          get: jest.fn(() => null) // No id in create mode
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ArealFormComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArealFacade, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealFormComponent);
    component = fixture.componentInstance;
    
    mockFacade.loadCategories.mockReturnValue(of([mockCategory]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values for create mode', () => {
    expect(component.arealForm.get('name')?.value).toBe('');
    expect(component.arealForm.get('categoryId')?.value).toBe('');
    expect(component.arealForm.get('enabled')?.value).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('should initialize form with areal data for edit mode', () => {
    fixture.componentRef.setInput('areal', mockAreal);
    component.ngOnInit();
    
    expect(component.arealForm.get('name')?.value).toBe('Test Areal');
    expect(component.arealForm.get('categoryId')?.value).toBe('cat1');
    expect(component.arealForm.get('enabled')?.value).toBe(true);
  });

  it('should load categories on init', () => {
    expect(mockFacade.loadCategories).toHaveBeenCalled();
    expect(component.categories()).toEqual([mockCategory]);
  });

  it('should handle query params for categoryId', () => {
    mockActivatedRoute.snapshot!.queryParams = { categoryId: 'cat2' };
    component.ngOnInit();
    
    expect(component.arealForm.get('categoryId')?.value).toBe('cat2');
  });

  it('should validate required fields', () => {
    const nameControl = component.arealForm.get('name');
    const categoryControl = component.arealForm.get('categoryId');

    nameControl?.setValue('');
    categoryControl?.setValue('');
    nameControl?.markAsTouched();
    categoryControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBe(true);
    expect(component.isFieldInvalid('categoryId')).toBe(true);
    expect(component.getFieldError('name')).toBe('Areal Name is required');
    expect(component.getFieldError('categoryId')).toBe('Category is required');
  });

  it('should validate name length', () => {
    const nameControl = component.arealForm.get('name');
    nameControl?.setValue('A');
    nameControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBe(true);
    expect(component.getFieldError('name')).toBe('Areal Name must be at least 2 characters');
  });

  it('should create areal on valid form submission', () => {
    mockFacade.createAreal.mockReturnValue(of(mockAreal));
    
    component.arealForm.patchValue({
      name: 'New Areal',
      categoryId: 'cat1',
      enabled: true
    });
    
    // Force form to be valid
    component.arealForm.get('name')?.setValidators([]);
    component.arealForm.get('categoryId')?.setValidators([]);
    component.arealForm.get('name')?.updateValueAndValidity();
    component.arealForm.get('categoryId')?.updateValueAndValidity();

    component.onSubmit();

    expect(mockFacade.createAreal).toHaveBeenCalledWith({
      name: 'New Areal',
      categoryId: 'cat1',
      enabled: true
    });
  });

  it('should update areal in edit mode', () => {
    // Set up route params to simulate edit mode with ID
    mockActivatedRoute.snapshot!.paramMap.get = jest.fn((key: string) => key === 'id' ? '1' : null);
    
    // Re-initialize component to pick up the route params
    component.ngOnInit();
    
    const mockObservable = {
      pipe: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    };
    mockFacade.updateAreal.mockReturnValue(mockObservable as any);
    
    component.arealForm.patchValue({
      id: '1',
      name: 'Updated Areal',
      categoryId: 'cat1',
      enabled: false
    });

    // Force form to be valid
    component.arealForm.get('name')?.setValidators([]);
    component.arealForm.get('categoryId')?.setValidators([]);
    component.arealForm.get('name')?.updateValueAndValidity();
    component.arealForm.get('categoryId')?.updateValueAndValidity();

    component.onSubmit();

    expect(mockFacade.updateAreal).toHaveBeenCalledWith('1', {
      arealId: '1',
      categoryId: 'cat1',
      name: 'Updated Areal',
      enabled: false
    });
  });

  it('should handle form validation errors on submit', () => {
    component.arealForm.patchValue({
      name: '',
      categoryId: ''
    });

    component.onSubmit();

    expect(mockFacade.createAreal).not.toHaveBeenCalled();
    expect(component.arealForm.get('name')?.touched).toBe(true);
    expect(component.arealForm.get('categoryId')?.touched).toBe(true);
  });

  it('should navigate to overview on cancel', () => {
    component.onCancel();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/overview']);
  });

  it('should delete areal when confirmed', async () => {
    // Set up route params to simulate edit mode with ID
    mockActivatedRoute.snapshot!.paramMap.get = jest.fn((key: string) => key === 'id' ? '1' : null);
    
    // Re-initialize component to pick up the route params
    component.ngOnInit();
    
    mockFacade.deleteAreal.mockReturnValue(of(true));
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await component.onDelete();

    expect(mockFacade.deleteAreal).toHaveBeenCalledWith('1');
  });

  it('should handle facade loading state', () => {
    const loadingSignal = signal(true);
    component.loading = loadingSignal;
    
    expect(component.loading()).toBe(true);
  });

  it('should handle facade error state', () => {
    const errorMessage = 'Test error';
    const errorSignal = signal(errorMessage);
    component.error = errorSignal;
    
    expect(component.error()).toBe(errorMessage);
  });

  it('should clear errors', () => {
    component.error.set('Some error');
    component.clearError();
    
    expect(component.error()).toBeNull();
    expect(mockFacade.clearError).toHaveBeenCalled();
  });

  it('should reset form', () => {
    component.arealForm.patchValue({
      name: 'Test',
      categoryId: 'cat1'
    });
    component.error.set('Test error');

    component.onCancel();

    expect(component.arealForm.get('name')?.value).toBe('');
    expect(component.error()).toBeNull();
  });

  it('should handle duplicate areal constraint error', () => {
    const duplicateError = {
      message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: areal.tenantId, areal.categoryId, areal.name'
    };
    mockFacade.createAreal.mockReturnValue(throwError(() => duplicateError));
    
    component.arealForm.patchValue({
      name: 'Duplicate Areal',
      categoryId: 'cat1',
      enabled: true
    });
    
    // Force form to be valid
    component.arealForm.get('name')?.setValidators([]);
    component.arealForm.get('categoryId')?.setValidators([]);
    component.arealForm.get('name')?.updateValueAndValidity();
    component.arealForm.get('categoryId')?.updateValueAndValidity();

    component.onSubmit();

    expect(component.error()).toBe('An areal with this name already exists in the selected category');
  });
});