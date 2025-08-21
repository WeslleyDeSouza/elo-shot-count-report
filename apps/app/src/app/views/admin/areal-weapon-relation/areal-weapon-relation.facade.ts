import { Injectable, inject } from "@angular/core";
import { AdminArealService, AdminWeaponService } from "@ui-elo/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize, combineLatest, forkJoin } from "rxjs";
import { ArealWeaponRelation, WeaponWithRelation, ArealWithWeapons } from "./areal-weapon-relation.model";
import { ArealCategory } from "../areal/areal.model";

@Injectable()
export class ArealWeaponRelationFacade {
  private adminArealService = inject(AdminArealService);
  private adminWeaponService = inject(AdminWeaponService);

  private _loading = new BehaviorSubject<boolean>(false);
  private _arealCategories = new BehaviorSubject<ArealCategory[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  public readonly loading$ = this._loading.asObservable();
  public readonly arealCategories$ = this._arealCategories.asObservable();
  public readonly error$ = this._error.asObservable();

  loadArealCategoriesWithWeapons(): Observable<ArealCategory[]> {
    this._loading.next(true);
    this._error.next(null);

    return forkJoin({
      areals: this.adminArealService.adminArealListArealGroupedByCategories(),
      weapons: this.adminWeaponService.adminWeaponListWeaponGroupedByCategories()
    }).pipe(
      map(({ areals, weapons }) => {
        const allWeapons = weapons.flatMap((wc: any) => 
          wc.weapons.map((w: any) => ({ ...w, categoryName: wc.name }))
        );

        return areals.map((category: any) => ({
          ...category,
          areas: category.areas.map((areal: any) => ({
            ...areal,
            categoryName: category.name,
            weapons: allWeapons.map((weapon: any) => ({
              ...weapon,
              hasRelation: Math.random() > 0.7, // Mock data - replace with actual API call
              relationId: Math.random() > 0.7 ? `rel-${weapon.id}-${areal.id}` : undefined
            }))
          }))
        }));
      }),
      catchError(error => {
        this._error.next('Failed to load areal categories and weapons');
        console.error('Error loading areal categories and weapons:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createWeaponRelation(arealId: string, weaponId: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    // Mock implementation - replace with actual API call
    return of(true).pipe(
      map(() => {
        console.log('Creating relation for areal:', arealId, 'weapon:', weaponId);
        return true;
      }),
      catchError(error => {
        this._error.next('Failed to create weapon relation');
        console.error('Error creating weapon relation:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  removeWeaponRelation(relationId: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    // Mock implementation - replace with actual API call
    return of(true).pipe(
      map(() => {
        console.log('Removing relation:', relationId);
        return true;
      }),
      catchError(error => {
        this._error.next('Failed to remove weapon relation');
        console.error('Error removing weapon relation:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  clearError(): void {
    this._error.next(null);
  }
}