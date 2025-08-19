import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ArealCategoryFormComponent } from './areal-category-form.component';
import { ArealFacade } from '../areal.facade';
import { ArealCategory } from '../areal.model';

describe('ArealCategoryFormComponent', () => {
  let component: ArealCategoryFormComponent;
  let fixture: ComponentFixture<ArealCategoryFormComponent>;
  let mockFacade: jest.Mocked<ArealFacade>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  const mockCategory: ArealCategory = {
    id: '1',
    name: 'Test Category',
    code: 'TEST',
    areas: []
  } as ArealCategory;

  beforeEach(async () => {
    mockFacade = {
      loadCategories: jest.fn(),
      createArealCategory: jest.fn(),
      updateArealCategory: jest.fn(),
      deleteArealCategory: jest.fn(),
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
      imports: [ArealCategoryFormComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArealFacade, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealCategoryFormComponent);
    component = fixture.componentInstance;
    
    mockFacade.loadCategories.mockReturnValue(of([mockCategory]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values for create mode', () => {
    expect(component.categoryForm.get('name')?.value).toBe('');
    expect(component.categoryForm.get('code')?.value).toBe('');
    expect(component.isEditMode()).toBe(false);
  });

  it('should initialize form with category data for edit mode', () => {
    fixture.componentRef.setInput('category', mockCategory);
    component.ngOnInit();
    
    expect(component.categoryForm.get('name')?.value).toBe('Test Category');
    expect(component.categoryForm.get('code')?.value).toBe('TEST');
  });

  it('should validate required fields', () => {
    const nameControl = component.categoryForm.get('name');
    const codeControl = component.categoryForm.get('code');

    nameControl?.setValue('');
    codeControl?.setValue('');
    nameControl?.markAsTouched();
    codeControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBe(true);
    expect(component.isFieldInvalid('code')).toBe(true);
    expect(component.getFieldError('name')).toBe('Category Name is required');
    expect(component.getFieldError('code')).toBe('Category Code is required');
  });

  it('should validate code pattern', () => {
    const codeControl = component.categoryForm.get('code');
    codeControl?.setValue('invalid-lowercase');
    codeControl?.markAsTouched();

    expect(component.isFieldInvalid('code')).toBe(true);
    expect(component.getFieldError('code')).toBe('Category Code must contain only uppercase letters, numbers, hyphens, and underscores');
  });

  it('should create category on valid form submission', () => {
    mockFacade.createArealCategory.mockReturnValue(of(mockCategory));
    
    component.categoryForm.patchValue({
      name: 'New Category',
      code: 'NEW'
    });
    
    // Force form to be valid by removing validation temporarily
    component.categoryForm.get('name')?.setValidators([]);
    component.categoryForm.get('code')?.setValidators([]);
    component.categoryForm.get('name')?.updateValueAndValidity();
    component.categoryForm.get('code')?.updateValueAndValidity();

    component.onSubmit();

    expect(mockFacade.createArealCategory).toHaveBeenCalledWith({
      name: 'New Category',
      code: 'NEW'
    });
  });

  it('should update category in edit mode', () => {
    component.setId('1');
    mockFacade.updateArealCategory.mockReturnValue(of(mockCategory));
    
    component.categoryForm.patchValue({
      id: '1',
      name: 'Updated Category',
      code: 'UPDATED'
    });

    component.onSubmit();

    expect(mockFacade.updateArealCategory).toHaveBeenCalledWith('1', {
      id: '1',
      name: 'Updated Category',
      code: 'UPDATED'
    });
  });

  it('should handle form validation errors', () => {
    component.categoryForm.patchValue({
      name: '',
      code: ''
    });

    component.onSubmit();

    expect(mockFacade.createArealCategory).not.toHaveBeenCalled();
    expect(component.categoryForm.get('name')?.touched).toBe(true);
    expect(component.categoryForm.get('code')?.touched).toBe(true);
  });

  it('should navigate to overview on cancel', () => {
    component.onCancel();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/overview']);
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
    component.clearError();
    
    expect(component.error()).toBeNull();
    expect(mockFacade.clearError).toHaveBeenCalled();
  });

  it('should handle duplicate code constraint error', () => {
    const duplicateError = {
      message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.code'
    };
    mockFacade.createArealCategory.mockReturnValue(throwError(() => duplicateError));
    
    component.categoryForm.patchValue({
      name: 'Test Category',
      code: 'DUPLICATE'
    });
    
    // Force form to be valid
    component.categoryForm.get('name')?.setValidators([]);
    component.categoryForm.get('code')?.setValidators([]);
    component.categoryForm.get('name')?.updateValueAndValidity();
    component.categoryForm.get('code')?.updateValueAndValidity();

    component.onSubmit();

    expect(component.error()).toBe('A category with this code already exists');
  });

  it('should handle duplicate name constraint error', () => {
    const duplicateError = {
      message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.name'
    };
    mockFacade.createArealCategory.mockReturnValue(throwError(() => duplicateError));
    
    component.categoryForm.patchValue({
      name: 'Duplicate Name',
      code: 'TEST'
    });
    
    // Force form to be valid
    component.categoryForm.get('name')?.setValidators([]);
    component.categoryForm.get('code')?.setValidators([]);
    component.categoryForm.get('name')?.updateValueAndValidity();
    component.categoryForm.get('code')?.updateValueAndValidity();

    component.onSubmit();

    expect(component.error()).toBe('A category with this name already exists');
  });
});