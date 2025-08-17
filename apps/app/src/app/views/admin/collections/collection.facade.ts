import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap, map, finalize } from 'rxjs';
import { Collection } from './collection.model';
import { AdminCollectionService } from '@ui-elo/apiClient';

@Injectable()
export class CollectionFacade {
  private _loading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);

  public readonly loading$ = this._loading.asObservable();
  public readonly error$ = this._error.asObservable();

  protected api = inject(AdminCollectionService);

  loadCollections(filterParams?: {
    enabled?: boolean;
    year?: string;
    pin?: string;
    arealCategoryId?: string;
    arealId?: string;
  }): Observable<Collection[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCollectionListCollections({
      enabled: filterParams?.enabled,
      year: filterParams?.year,
      pin: filterParams?.pin,
      arealCategoryId: filterParams?.arealCategoryId,
      arealId: filterParams?.arealId
    }).pipe(
      map((collections: any[]) => collections.map(c => new Collection(c))),
      catchError((error) => {
        this._error.next('Failed to load collections');
        console.error('Error loading collections:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  getCollection(id: string): Observable<Collection | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCollectionGetCollection({ id }).pipe(
      map((collection: any) => new Collection(collection)),
      catchError((error) => {
        this._error.next('Failed to load collection');
        console.error('Error loading collection:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createCollection(collection: any): Observable<Collection | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCollectionCreateCollection({
      body: collection
    }).pipe(
      map((createdCollection: any) => new Collection(createdCollection)),
      catchError((error) => {
        this._error.next('Failed to create collection');
        console.error('Error creating collection:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateCollection(id: string, collection: any): Observable<Collection | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCollectionUpdateCollection({
      id: id,
      body: collection
    }).pipe(
      map((updatedCollection: any) => new Collection(updatedCollection)),
      catchError((error) => {
        this._error.next('Failed to update collection');
        console.error('Error updating collection:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteCollection(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCollectionDeleteCollection({ id }).pipe(
      map(() => true),
      catchError((error) => {
        this._error.next('Failed to delete collection');
        console.error('Error deleting collection:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }


  refreshCollections(): void {
    // Reset any cached data if needed
  }

  clearError(): void {
    this._error.next(null);
  }
}
