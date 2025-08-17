import { Injectable } from "@angular/core";
import { AdminWeaponService, AdminWeaponCategoryService } from "@ui-elo/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize, firstValueFrom } from "rxjs";
import { Weapon, WeaponCategory } from "./weapon.model";

type WeaponModel = Weapon
type WeaponCategoryModel = WeaponCategory

@Injectable()
export class WeaponFacade {
  private _loading = new BehaviorSubject<boolean>(false);
  private _categories = new BehaviorSubject<WeaponCategory[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  public readonly loading$ = this._loading.asObservable();
  public readonly categories$ = this._categories.asObservable();
  public readonly error$ = this._error.asObservable();

  constructor(
    private adminWeaponService: AdminWeaponService,
    private adminWeaponCategoryService: AdminWeaponCategoryService
  ) { }

  loadCategories(): Observable<WeaponCategory[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponService.adminWeaponListWeapon().pipe(
      map((categories: any[]) =>
        categories.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          weapons: c.weapons || []
        } as WeaponCategory)).sort((a, b) => (a.code + '').localeCompare(b.code + ''))
      ),
      catchError(error => {
        this._error.next('Failed to load weapon categories');
        console.error('Error loading weapon categories:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createWeapon(weapon: Partial<WeaponModel>): Observable<Weapon | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponService.adminWeaponCreateWeapon({
      body: weapon as any,
    }).pipe(
      map((createdWeapon: any) => ({
        id: createdWeapon.id,
        name: createdWeapon.name,
        nameDe: createdWeapon.nameDe,
        nameFr: createdWeapon.nameFr,
        nameIt: createdWeapon.nameIt,
        categoryId: createdWeapon.categoryId,
        enabled: createdWeapon.enabled,
        inWeight: createdWeapon.inWeight
      } as Weapon)),
      catchError(error => {
        this._error.next('Failed to create weapon');
        console.error('Error creating weapon:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateWeapon(id: string, weapon: Partial<WeaponModel>): Observable<Weapon | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponService.adminWeaponUpdateWeapon({
      id: id,
      body: weapon as any,
    }).pipe(
      map((updatedWeapon: any) => ({
        id: updatedWeapon.id,
        name: updatedWeapon.name,
        nameDe: updatedWeapon.nameDe,
        nameFr: updatedWeapon.nameFr,
        nameIt: updatedWeapon.nameIt,
        categoryId: updatedWeapon.categoryId,
        enabled: updatedWeapon.enabled,
        inWeight: updatedWeapon.inWeight
      } as Weapon)),
      catchError(error => {
        this._error.next('Failed to update weapon');
        console.error('Error updating weapon:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteWeapon(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponService.adminWeaponDeleteWeapon({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete weapon');
        console.error('Error deleting weapon:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createWeaponCategory(category: Partial<WeaponCategoryModel>): Observable<WeaponCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponCategoryService.adminWeaponCategoryCreate({
      body: category as any,
    }).pipe(
      map((createdCategory: any) => ({
        id: createdCategory.id,
        name: createdCategory.name,
        code: createdCategory.code,
        weapons: []
      } as WeaponCategory)),
      catchError(error => {
        this._error.next('Failed to create weapon category');
        console.error('Error creating weapon category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateWeaponCategory(id: string, category: Partial<WeaponCategoryModel>): Observable<WeaponCategory | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponCategoryService.adminWeaponCategoryUpdate({
      id: id,
      body: category as any,
    }).pipe(
      map((updatedCategory: any) => ({
        id: updatedCategory.id,
        name: updatedCategory.name,
        code: updatedCategory.code,
        weapons: []
      } as WeaponCategory)),
      catchError(error => {
        this._error.next('Failed to update weapon category');
        console.error('Error updating weapon category:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteWeaponCategory(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.adminWeaponCategoryService.adminWeaponCategoryDelete({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete weapon category');
        console.error('Error deleting weapon category:', error);
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

  getCurrentCategories(): WeaponCategory[] {
    return this._categories.value;
  }

  isLoading(): boolean {
    return this._loading.value;
  }
}