import { Injectable } from "@angular/core";
import { AdminArealService, AdminArealCategoryService } from "@ui-elo/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize, firstValueFrom } from "rxjs";
import { Areal, ArealCategory } from "./areal.model";

type ArealModel = Areal
type ArealCategoryModel = ArealCategory

@Injectable()
export class ArealFacade {
  private _loading = new BehaviorSubject<boolean>(false);
  private _categories = new BehaviorSubject<ArealCategory[]>([]);
  private _error = new BehaviorSubject<string | null>(null);
  private _allowedRules = new BehaviorSubject<string[]>([]);

  private parseConstraintError(error: any): string {
    const errorMessage = error?.message || error?.error?.message || '';

    if (errorMessage.includes('UNIQUE constraint failed')) {
      if (errorMessage.includes('areal.tenantId, areal.categoryId, areal.name')) {
        return 'An areal with this name already exists in the selected category';
      }
      if (errorMessage.includes('weapon.tenantId, weapon.categoryId, weapon.name')) {
        return 'A weapon with this name already exists in the selected category';
      }
      if (errorMessage.includes('areal_category.tenantId, areal_category.code')) {
        return 'A category with this code already exists';
      }
      if (errorMessage.includes('areal_category.tenantId, areal_category.name')) {
        return 'A category with this name already exists';
      }
      return 'This item already exists';
    }

    return errorMessage || 'An unexpected error occurred';
  }

  public readonly loading$ = this._loading.asObservable();
  public readonly categories$ = this._categories.asObservable();
  public readonly error$ = this._error.asObservable();
  public readonly allowedRules$ = this._allowedRules.asObservable();

  constructor(
    private adminArealService: AdminArealService,
    private adminArealCategoryService: AdminArealCategoryService
  ) { }

  loadAllowedArealRules(): Observable<string[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealService.adminArealAllowedArealRulSet().pipe(
      map((rules: string[]) => rules || []),
      catchError(error => {
        this._error.next('Failed to load allowed areal rules');
        console.error('Error loading allowed areal rules:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  loadCategories(): Observable<ArealCategory[]> {
    this._loading.next(true);
    this._error.next(null);
    return this.adminArealService.adminArealListArealGroupedByCategories({ withWeapons: false }).pipe(
      map((categories: any[]) =>
        categories.map(c => new ArealCategory(c)).sort((a, b) => (a.code + '').localeCompare(b.code + ''))
      ),
      catchError(error => {
        this._error.next('Failed to load areal categories');
        console.error('Error loading areal categories:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createAreal(areal: Partial<ArealModel>): Observable<Areal | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealService.adminArealCreateAreal({
      body: areal as any,
    }).pipe(
      map((createdAreal: any) => new Areal(createdAreal)),
      catchError(error => {
        const errorMessage = this.parseConstraintError(error);
        this._error.next(errorMessage.startsWith('An areal') ? errorMessage : 'Failed to create areal');
        console.error('Error creating areal:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateAreal(id: string, areal: Partial<ArealModel>): Observable<Areal | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealService.adminArealUpdateAreal({
      id: id,
      body: areal as any,
    }).pipe(
      map((updatedAreal: any) => new Areal(updatedAreal)),
      catchError(error => {
        const errorMessage = this.parseConstraintError(error);
        this._error.next(errorMessage.startsWith('An areal') ? errorMessage : 'Failed to update areal');
        console.error('Error updating areal:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteAreal(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealService.adminArealDeleteAreal({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete areal');
        console.error('Error deleting areal:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createArealCategory(category: Partial<ArealCategoryModel>): Observable<ArealCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealCategoryService.adminArealCategoryCreate({
      body: category as any,
    }).pipe(
      map((createdCategory: any) => new ArealCategory(createdCategory)),
      catchError(error => {
        const errorMessage = this.parseConstraintError(error);
        this._error.next(errorMessage.startsWith('A category') ? errorMessage : 'Failed to create areal category');
        console.error('Error creating areal category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateArealCategory(id: string, category: Partial<ArealCategoryModel>): Observable<ArealCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealCategoryService.adminArealCategoryUpdate({
      id: id,
      body: category as any,
    }).pipe(
      map((updatedCategory: any) => new ArealCategory(updatedCategory)),
      catchError(error => {
        const errorMessage = this.parseConstraintError(error);
        this._error.next(errorMessage.startsWith('A category') ? errorMessage : 'Failed to update areal category');
        console.error('Error updating areal category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteArealCategory(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminArealCategoryService.adminArealCategoryDelete({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete areal category');
        console.error('Error deleting areal category:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  refreshCategories(): void {
    this.loadCategories().subscribe(categories => {
      this._categories.next(categories);
    });
  }

  clearError(): void {
    this._error.next(null);
  }

  getCurrentCategories(): ArealCategory[] {
    return this._categories.value;
  }

  isLoading(): boolean {
    return this._loading.value;
  }

  refreshAllowedRules(): void {
    this.loadAllowedArealRules().subscribe(rules => {
      this._allowedRules.next(rules);
    });
  }

  getCurrentAllowedRules(): string[] {
    return this._allowedRules.value;
  }

  validateCategoryCodePrefix(code: string): boolean {
    const allowedRules = this.getCurrentAllowedRules();
    if (allowedRules.length === 0) return true;
    
    return allowedRules.some(rule => code.toString().startsWith(rule.toString()));
  }
}
