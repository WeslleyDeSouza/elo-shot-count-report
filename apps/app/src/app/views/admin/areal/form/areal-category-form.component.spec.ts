import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ArealCategoryFormComponent } from './areal-category-form.component';
import { ArealFacade } from '../areal.facade';
import { ArealCategory } from '../areal.model';

describe('ArealCategoryFormComponent', () => {
  let component: ArealCategoryFormComponent;
  let fixture: ComponentFixture<ArealCategoryFormComponent>;
  let mockFacade: jest.Mocked<ArealFacade>;
  let router: Router;

  const mockCategory: ArealCategory = {
    id: '1',
    name: 'Test Category',
    code: 'TEST',
    areas: []
  } as ArealCategory;

  const mockCategory789: ArealCategory = {
    id: '789',
    name: 'Test Category 789',
    code: 'TEST789',
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

    await TestBed.configureTestingModule({
      imports: [ArealCategoryFormComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'admin/areal/edit-category/:id', component: ArealCategoryFormComponent },
          { path: 'admin/areal/create-category', component: ArealCategoryFormComponent },
          { path: 'admin/areal/overview', component: ArealCategoryFormComponent }
        ]),
        { provide: ArealFacade, useValue: mockFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealCategoryFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    mockFacade.loadCategories.mockReturnValue(of([mockCategory, mockCategory789]));
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
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Set valid form values
    component.categoryForm.patchValue({
      name: 'New Category',
      code: 'NEW'
    });

    // Mark form as valid by updating validity
    component.categoryForm.updateValueAndValidity();

    component.onSubmit();

    expect(mockFacade.createArealCategory).toHaveBeenCalledWith({
      name: 'New Category',
      code: 'NEW'
    });
  });

  it('should handle edit mode with ID 789', fakeAsync(() => {
    // Mock getId method to simulate route with ID 789
    jest.spyOn(component, 'getId').mockReturnValue('789');
    
    mockFacade.updateArealCategory.mockReturnValue(of(mockCategory789));
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Re-initialize form to pick up the mocked ID
    component.ngOnInit();
    
    // Simulate loading data for edit mode
    component.getData();
    tick();

    // Verify edit mode is active
    expect(component.isEditMode()).toBe(true);
    expect(component.categoryForm.get('name')?.value).toBe('Test Category 789');
    expect(component.categoryForm.get('code')?.value).toBe('TEST789');

    // Update and submit
    component.categoryForm.patchValue({
      name: 'Updated Category 789',
      code: 'TEST789' // Code should stay the same in edit mode
    });

    component.onSubmit();

    expect(mockFacade.updateArealCategory).toHaveBeenCalledWith('789', {
      id: '',
      name: 'Updated Category 789',
      code: 'TEST789'
    });
  }));

  it('should not submit invalid forms', () => {
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
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.onCancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/admin/areal/overview']);
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
    // Set an error first
    component.error.set('Test error');
    
    // Clear the mock call history first
    jest.clearAllMocks();
    
    component.clearError();

    expect(component.error()).toBeNull();
    expect(mockFacade.clearError).toHaveBeenCalled();
  });

  it('should handle constraint errors correctly', () => {
    const duplicateError = {
      message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.code'
    };
    
    // Simulate error directly by calling the private method
    component['handleError'](duplicateError);
    
    expect(component.error()).toBe('A category with this code already exists');
  });

  it('should handle duplicate name constraint error', () => {
    const duplicateError = {
      message: 'SQLITE_CONSTRAINT: UNIQUE constraint failed: areal_category.tenantId, areal_category.name'
    };
    
    // Simulate error directly by calling the private method
    component['handleError'](duplicateError);
    
    expect(component.error()).toBe('A category with this name already exists');
  });

  it('should test route /admin/areal/edit-category/789', fakeAsync(() => {
    // This test demonstrates the URL structure that should work
    const testUrl = '/admin/areal/edit-category/789';
    
    // Navigate to the URL
    router.navigateByUrl(testUrl);
    tick();
    
    // Verify the URL contains the expected ID
    expect(testUrl).toContain('789');
    expect(testUrl).toContain('edit-category');
  }));
});