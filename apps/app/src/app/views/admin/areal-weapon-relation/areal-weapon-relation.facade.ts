import { Injectable, inject } from "@angular/core";
import { AdminArealService, AdminWeaponService } from "@ui-elo/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize, combineLatest, forkJoin } from "rxjs";
import { ArealWeaponRelation, WeaponWithRelation, ArealWithWeapons } from "./areal-weapon-relation.model";
import { ArealCategory } from "../areal/areal.model";

interface ExtendedArealCategory extends Omit<ArealCategory, 'areas'> {
  areas: ArealWithWeapons[];
}

@Injectable()
export class ArealWeaponRelationFacade {
  private adminArealService = inject(AdminArealService);
  private adminWeaponService = inject(AdminWeaponService);

  private _loading = new BehaviorSubject<boolean>(false);
  private _arealCategories = new BehaviorSubject<ExtendedArealCategory[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  public readonly loading$ = this._loading.asObservable();
  public readonly arealCategories$ = this._arealCategories.asObservable();
  public readonly error$ = this._error.asObservable();

  loadArealCategoriesWithWeapons(): Observable<ExtendedArealCategory[]> {
    this._loading.next(true);
    this._error.next(null);

    return forkJoin({
      areals: this.adminArealService.adminArealListArealGroupedByCategories({ withWeapons: false }),
      weapons: this.adminWeaponService.adminWeaponListWeapon({})
    }).pipe(
      map(({ areals, weapons }) => {
        const allWeapons = weapons.flatMap((wc: any) =>
          wc.weapons.map((w: any) => ({ ...w, categoryName: wc.name }))
        );

        const categories = areals.map((category: any) => {
          const arealCategory = new ArealCategory(category);
          return {
            ...arealCategory,
            areas: category.areas.map((areal: any) => ({
              ...areal,
              categoryName: category.name,
              weaponLinks: allWeapons.map((weapon: any) => ({
                ...weapon,
                hasRelation: Math.random() > 0.7, // Mock data - replace with actual API call
                relationId: Math.random() > 0.7 ? `rel-${weapon.id}-${areal.id}` : undefined
              }))
            }))
          } as ExtendedArealCategory;
        });
        
        // Update the cached data
        this._arealCategories.next(categories);
        return categories;
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
        // Update local cache on success
        this.updateLocalWeaponRelation(arealId, weaponId, true);
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
        // Update local cache on success
        this.updateLocalWeaponRelationByRelationId(relationId, false);
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

  private updateLocalWeaponRelation(arealId: string, weaponId: string, hasRelation: boolean): void {
    const currentCategories = this._arealCategories.value;
    const updatedCategories = currentCategories.map(category => ({
      ...category,
      areas: category.areas.map(areal => {
        if (areal.id === arealId) {
          return {
            ...areal,
            weaponLinks: areal.weaponLinks?.map(weapon => {
              if (weapon.id === weaponId) {
                return {
                  ...weapon,
                  hasRelation,
                  relationId: hasRelation ? `rel-${weaponId}-${arealId}` : undefined
                };
              }
              return weapon;
            })
          };
        }
        return areal;
      })
    }));

    this._arealCategories.next(updatedCategories);
  }

  private updateLocalWeaponRelationByRelationId(relationId: string, hasRelation: boolean): void {
    const currentCategories = this._arealCategories.value;
    const updatedCategories = currentCategories.map(category => ({
      ...category,
      areas: category.areas.map(areal => ({
        ...areal,
        weaponLinks: areal.weaponLinks?.map(weapon => {
          if (weapon.relationId === relationId) {
            return {
              ...weapon,
              hasRelation,
              relationId: hasRelation ? relationId : undefined
            };
          }
          return weapon;
        })
      }))
    }));

    this._arealCategories.next(updatedCategories);
  }
}
