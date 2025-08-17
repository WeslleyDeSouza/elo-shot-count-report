import {inject, Injectable} from "@angular/core";
import { Observable, BehaviorSubject, map, catchError, of, finalize, firstValueFrom } from "rxjs";
import { Weapon, WeaponCategory } from "./weapon.model";
import {AdminWeaponService, AdminWeaponCategoryService} from "@ui-elo/apiClient";

/**
 * Facade service for managing weapon and weapon category operations.
 * Provides a simplified interface for weapon-related CRUD operations
 * with loading states and error handling.
 */
@Injectable()
export class WeaponFacade {
  // Internal state management
  private _loading = new BehaviorSubject<boolean>(false);
  private _categories = new BehaviorSubject<WeaponCategory[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  // Public observables for component consumption
  public readonly loading$ = this._loading.asObservable();
  public readonly categories$ = this._categories.asObservable();
  public readonly error$ = this._error.asObservable();
  
  // Injected API services
  protected api = inject(AdminWeaponService);
  protected categoryApi = inject(AdminWeaponCategoryService);
  
  constructor() { }

  /**
   * Loads all weapon categories with their associated weapons.
   * Categories are sorted by code in ascending order.
   * @returns Observable of weapon categories array
   */
  loadCategories(): Observable<WeaponCategory[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminWeaponListWeapon().pipe(
      map((categories: any[]) =>
        categories.map(c => new WeaponCategory(c)).sort((a, b) => (a.code + '').localeCompare(b.code + ''))
      ),
      catchError(error => {
        this._error.next('Failed to load weapon categories');
        console.error('Error loading weapon categories:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Creates a new weapon.
   * @param weapon - Partial weapon data for creation
   * @returns Observable of created weapon or null if failed
   */
  createWeapon(weapon: Partial<Weapon>): Observable<Weapon | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminWeaponCreateWeapon({
      body: weapon as any,
    }).pipe(
      map((createdWeapon: any) => new Weapon(createdWeapon)),
      catchError(error => {
        this._error.next('Failed to create weapon');
        console.error('Error creating weapon:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Updates an existing weapon.
   * @param id - Weapon ID to update
   * @param weapon - Partial weapon data for update
   * @returns Observable of updated weapon or null if failed
   */
  updateWeapon(id: string, weapon: Partial<Weapon>): Observable<Weapon | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminWeaponUpdateWeapon({
      id: id,
      body: weapon as any,
    }).pipe(
      map((updatedWeapon: any) => new Weapon(updatedWeapon)),
      catchError(error => {
        this._error.next('Failed to update weapon');
        console.error('Error updating weapon:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Deletes a weapon by ID.
   * @param id - Weapon ID to delete
   * @returns Observable boolean indicating success
   */
  deleteWeapon(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminWeaponDeleteWeapon({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete weapon');
        console.error('Error deleting weapon:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Creates a new weapon category.
   * @param category - Partial weapon category data for creation
   * @returns Observable of created category or null if failed
   */
  createWeaponCategory(category: Partial<WeaponCategory>): Observable<WeaponCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.categoryApi.adminWeaponCategoryCreateWeaponCategory({
      body: category as any,
    }).pipe(
      map((createdCategory: any) => new WeaponCategory(createdCategory)),
      catchError(error => {
        this._error.next('Failed to create weapon category');
        console.error('Error creating weapon category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Updates an existing weapon category.
   * @param id - Category ID to update
   * @param category - Partial category data for update
   * @returns Observable of updated category or null if failed
   */
  updateWeaponCategory(id: string, category: Partial<WeaponCategory>): Observable<WeaponCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.categoryApi.adminWeaponCategoryUpdateWeaponCategory({
      id: id,
      body: category as any,
    }).pipe(
      map((updatedCategory: any) => new WeaponCategory(updatedCategory)),
      catchError(error => {
        this._error.next('Failed to update weapon category');
        console.error('Error updating weapon category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Deletes a weapon category by ID.
   * @param id - Category ID to delete
   * @returns Observable boolean indicating success
   */
  deleteWeaponCategory(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.categoryApi.adminWeaponCategoryDeleteWeaponCategory({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete weapon category');
        console.error('Error deleting weapon category:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Refreshes the categories by reloading them from the server.
   * Updates the internal categories state.
   */
  refreshCategories(): void {
    this.loadCategories().subscribe(categories => {
      this._categories.next(categories);
    });
  }

  /**
   * Clears any current error state.
   */
  clearError(): void {
    this._error.next(null);
  }

  /**
   * Gets the current categories without triggering a new load.
   * @returns Current weapon categories array
   */
  getCurrentCategories(): WeaponCategory[] {
    return this._categories.value;
  }

  /**
   * Checks if any operation is currently loading.
   * @returns Current loading state
   */
  isLoading(): boolean {
    return this._loading.value;
  }
}
