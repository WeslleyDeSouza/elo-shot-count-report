import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { ArealComponent } from './areal.component';
import { ArealFacade } from '../areal.facade';
import { Areal, ArealCategory } from '../areal.model';
import { EmptyStateComponent } from '../../../../components';

describe('ArealComponent', () => {
  let component: ArealComponent;
  let fixture: ComponentFixture<ArealComponent>;
  let mockFacade: jasmine.SpyObj<ArealFacade>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAreal1: Areal = {
    id: '1',
    name: 'Test Areal 1',
    categoryId: 'cat1',
    enabled: true
  } as Areal;

  const mockAreal2: Areal = {
    id: '2',
    name: 'Test Areal 2',
    categoryId: 'cat1',
    enabled: false
  } as Areal;

  const mockCategory: ArealCategory = {
    id: 'cat1',
    name: 'Test Category',
    code: 'TEST',
    areas: [mockAreal1, mockAreal2]
  } as ArealCategory;

  beforeEach(async () => {
    mockFacade = jasmine.createSpyObj('ArealFacade', [
      'loadCategories',
      'deleteAreal',
      'updateAreal',
      'deleteArealCategory',
      'refreshCategories',
      'clearError'
    ], {
      loading$: of(false),
      error$: of(null)
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ArealComponent, NgbCollapseModule, EmptyStateComponent],
      providers: [
        { provide: ArealFacade, useValue: mockFacade },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealComponent);
    component = fixture.componentInstance;
    
    mockFacade.loadCategories.and.returnValue(of([mockCategory]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(mockFacade.loadCategories).toHaveBeenCalled();
    expect(component.allCategories()).toEqual([mockCategory]);
  });

  it('should filter categories by search text', () => {
    component.allCategories.set([mockCategory]);
    component.searchText.set('test');

    const filtered = component.filteredCategories();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Test Category');
  });

  it('should filter areas within categories by search text', () => {
    component.allCategories.set([mockCategory]);
    component.searchText.set('areal 1');

    const filtered = component.filteredCategories();
    expect(filtered[0].areas.length).toBe(1);
    expect(filtered[0].areas[0].name).toBe('Test Areal 1');
  });

  it('should return all categories when search is empty', () => {
    component.allCategories.set([mockCategory]);
    component.searchText.set('');

    const filtered = component.filteredCategories();
    expect(filtered).toEqual([mockCategory]);
  });

  it('should handle search input', () => {
    const event = { target: { value: 'search term' } };
    component.searchAreas(event);
    
    expect(component.searchText()).toBe('search term');
  });

  it('should refresh areas', () => {
    component.refreshAreas();
    
    expect(mockFacade.refreshCategories).toHaveBeenCalled();
    expect(mockFacade.loadCategories).toHaveBeenCalled();
  });

  it('should navigate to create areal without category', () => {
    component.createAreal();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/create']);
  });

  it('should navigate to create areal with category', () => {
    component.createAreal('cat1');
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/create'], { 
      queryParams: { categoryId: 'cat1' } 
    });
  });

  it('should navigate to edit areal', () => {
    component.editAreal(mockAreal1);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/edit', '1']);
  });

  it('should delete areal after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockFacade.deleteAreal.and.returnValue(of(true));
    
    component.deleteAreal(mockAreal1);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Test Areal 1?');
    expect(mockFacade.deleteAreal).toHaveBeenCalledWith('1');
  });

  it('should not delete areal if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.deleteAreal(mockAreal1);
    
    expect(mockFacade.deleteAreal).not.toHaveBeenCalled();
  });

  it('should navigate to create category', () => {
    component.createArealCategory();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/create-category']);
  });

  it('should navigate to edit category', () => {
    component.editArealCategory(mockCategory);
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/edit-category', 'cat1']);
  });

  it('should delete category after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockFacade.deleteArealCategory.and.returnValue(of(true));
    
    component.deleteArealCategory(mockCategory);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete category Test Category?');
    expect(mockFacade.deleteArealCategory).toHaveBeenCalledWith('cat1');
  });

  it('should toggle areal enabled state', () => {
    mockFacade.updateAreal.and.returnValue(of(mockAreal1));
    
    component.toggleArealEnabled(mockAreal1);
    
    expect(mockFacade.updateAreal).toHaveBeenCalledWith('1', {
      ...mockAreal1,
      enabled: false
    });
  });

  it('should toggle category collapse state', () => {
    component.toggleCategoryCollapse('cat1');
    
    expect(component.collapsedStates()['cat1']).toBe(false);
    
    component.toggleCategoryCollapse('cat1');
    expect(component.collapsedStates()['cat1']).toBe(true);
  });

  it('should check if category is collapsed', () => {
    expect(component.isCategoryCollapsed('cat1')).toBe(true); // default
    
    component.collapsedStates.set({ cat1: false });
    expect(component.isCategoryCollapsed('cat1')).toBe(false);
  });

  it('should navigate to bulk editor', () => {
    component.openBulkEditor();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/areal/bulk-edit']);
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
    
    expect(mockFacade.clearError).toHaveBeenCalled();
  });

  it('should reload categories after successful areal deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockFacade.deleteAreal.and.returnValue(of(true));
    
    component.deleteAreal(mockAreal1);
    
    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after delete
  });

  it('should reload categories after successful category deletion', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockFacade.deleteArealCategory.and.returnValue(of(true));
    
    component.deleteArealCategory(mockCategory);
    
    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after delete
  });

  it('should reload categories after successful areal enable toggle', () => {
    mockFacade.updateAreal.and.returnValue(of(mockAreal1));
    
    component.toggleArealEnabled(mockAreal1);
    
    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after update
  });
});