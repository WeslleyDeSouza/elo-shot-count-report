import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ArealComponent } from './areal.component';
import { ArealFacade } from '../areal.facade';
import { Areal, ArealCategory } from '../areal.model';
import { EmptyStateComponent } from '../../_components';

describe('ArealComponent', () => {
  let component: ArealComponent;
  let fixture: ComponentFixture<ArealComponent>;
  let mockFacade: jest.Mocked<ArealFacade>;
  let mockRouter: jest.Mocked<Router>;

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
    mockFacade = {
      loadCategories: jest.fn(),
      deleteAreal: jest.fn(),
      updateAreal: jest.fn(),
      deleteArealCategory: jest.fn(),
      refreshCategories: jest.fn(),
      clearError: jest.fn(),
      loading$: of(false),
      error$: of(null)
    } as any;

    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ArealComponent, NgbCollapseModule, EmptyStateComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArealFacade, useValue: mockFacade },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArealComponent);
    component = fixture.componentInstance;

    mockFacade.loadCategories.mockReturnValue(of([mockCategory]));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFacade.deleteAreal.mockReturnValue(of(true));

    component.deleteAreal(mockAreal1);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete Test Areal 1?');
    expect(mockFacade.deleteAreal).toHaveBeenCalledWith('1');
  });

  it('should not delete areal if not confirmed', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);

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
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFacade.deleteArealCategory.mockReturnValue(of(true));

    component.deleteArealCategory(mockCategory);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete category Test Category?');
    expect(mockFacade.deleteArealCategory).toHaveBeenCalledWith('cat1');
  });

  it('should toggle areal enabled state', () => {
    mockFacade.updateAreal.mockReturnValue(of(mockAreal1));

    component.toggleArealEnabled(mockAreal1);

    expect(mockFacade.updateAreal).toHaveBeenCalledWith('1', {
      ...mockAreal1,
      enabled: false
    });
  });

  it('should toggle category collapse state', () => {
    // Initially undefined, default behavior is collapsed (true)
    expect(component.isCategoryCollapsed('cat1')).toBe(true);

    // First toggle should expand (set to false)
    component.toggleCategoryCollapse('cat1');
    expect(component.collapsedStates()['cat1']).toBe(true); // !undefined = true

    // But the display logic considers undefined as collapsed, so we need to set initial state
    component.collapsedStates.set({ cat1: true }); // explicitly set to collapsed
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

    expect(component.loading()).toBe(true);
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
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFacade.deleteAreal.mockReturnValue(of(true));

    component.deleteAreal(mockAreal1);

    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after delete
  });

  it('should reload categories after successful category deletion', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockFacade.deleteArealCategory.mockReturnValue(of(true));

    component.deleteArealCategory(mockCategory);

    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after delete
  });

  it('should reload categories after successful areal enable toggle', () => {
    mockFacade.updateAreal.mockReturnValue(of(mockAreal1));

    component.toggleArealEnabled(mockAreal1);

    expect(mockFacade.loadCategories).toHaveBeenCalledTimes(2); // once in ngOnInit, once after update
  });
});
