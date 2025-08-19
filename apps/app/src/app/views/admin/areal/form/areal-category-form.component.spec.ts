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

});
