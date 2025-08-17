import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArealFormComponent } from './areal-form.component';
import { ArealFacade } from '../areal.facade';
import { Areal, ArealCategory } from '../areal.model';

describe('ArealFormComponent', () => {
  let component: ArealFormComponent;
  let fixture: ComponentFixture<ArealFormComponent>;
  let mockFacade: jasmine.SpyObj<ArealFacade>;
  let mockRouter: jasmine.SpyObj<Router>;
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
    mockFacade = jasmine.createSpyObj('ArealFacade', [
      'loadCategories',
      'createAreal',
      'updateAreal',
      'deleteAreal',
      'clearError'
    ], {
      loading$: of(false),
      error$: of(null)
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [ArealFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ArealFacade, useValue: mockFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealFormComponent);
    component = fixture.componentInstance;
    
    mockFacade.loadCategories.and.returnValue(of([mockCategory]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values for create mode', () => {
    expect(component.arealForm.get('name')?.value).toBe('');
    expect(component.arealForm.get('categoryId')?.value).toBe('');
    expect(component.arealForm.get('enabled')?.value).toBe(true);
    expect(component.isEditMode()).toBeFalse();
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

    expect(component.isFieldInvalid('name')).toBeTrue();
    expect(component.isFieldInvalid('categoryId')).toBeTrue();
    expect(component.getFieldError('name')).toBe('Areal Name is required');
    expect(component.getFieldError('categoryId')).toBe('Category is required');
  });

  it('should validate name length', () => {
    const nameControl = component.arealForm.get('name');
    nameControl?.setValue('A');
    nameControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBeTrue();
    expect(component.getFieldError('name')).toBe('Areal Name must be at least 2 characters');
  });

  it('should create areal on valid form submission', () => {
    mockFacade.createAreal.and.returnValue(of(mockAreal));
    
    component.arealForm.patchValue({
      name: 'New Areal',
      categoryId: 'cat1',
      enabled: true
    });

    component.onSubmit();

    expect(mockFacade.createAreal).toHaveBeenCalledWith({
      name: 'New Areal',
      categoryId: 'cat1',
      enabled: true
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/overview']);
  });

  it('should update areal in edit mode', () => {
    component.setId('1');
    mockFacade.updateAreal.and.returnValue(of(mockAreal));
    
    component.arealForm.patchValue({
      id: '1',
      name: 'Updated Areal',
      categoryId: 'cat1',
      enabled: false
    });

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
    expect(component.arealForm.get('name')?.touched).toBeTrue();
    expect(component.arealForm.get('categoryId')?.touched).toBeTrue();
  });

  it('should navigate to overview on cancel', () => {
    component.onCancel();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/overview']);
  });

  it('should delete areal when confirmed', async () => {
    component.setId('1');
    mockFacade.deleteAreal.and.returnValue(of(true));
    spyOn(window, 'confirm').and.returnValue(true);

    await component.onDelete();

    expect(mockFacade.deleteAreal).toHaveBeenCalledWith('1');
  });

  it('should handle facade loading state', () => {
    mockFacade.loading$ = of(true);
    component.ngOnInit();
    
    expect(component.loading()).toBeTrue();
  });

  it('should handle facade error state', () => {
    const errorMessage = 'Test error';
    mockFacade.error$ = of(errorMessage);
    component.ngOnInit();
    
    expect(component.error()).toBe(errorMessage);
  });

  it('should clear errors', () => {
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
    mockFacade.createAreal.and.returnValue(throwError(() => duplicateError));
    
    component.arealForm.patchValue({
      name: 'Duplicate Areal',
      categoryId: 'cat1',
      enabled: true
    });

    component.onSubmit();

    expect(component.error()).toBe('An areal with this name already exists in the selected category');
  });
});