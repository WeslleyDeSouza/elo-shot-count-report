import { Injectable } from "@angular/core";
// TODO: Update import once API client is generated
// import { AdminCoordinationOfficeService } from "@ui-elo/apiClient";
import { Observable, BehaviorSubject, map, catchError, of, finalize } from "rxjs";
import { CoordinationOffice } from "./coordination-office.model";

type CoordinationOfficeModel = CoordinationOffice

@Injectable()
export class CoordinationOfficeFacade {
  private _loading = new BehaviorSubject<boolean>(false);
  private _coordinationOffices = new BehaviorSubject<CoordinationOffice[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  public readonly loading$ = this._loading.asObservable();
  public readonly coordinationOffices$ = this._coordinationOffices.asObservable();
  public readonly error$ = this._error.asObservable();

  constructor(
    // TODO: Inject AdminCoordinationOfficeService once API client is generated
    // private adminCoordinationOfficeService: AdminCoordinationOfficeService
  ) { }

  loadCoordinationOffices(): Observable<CoordinationOffice[]> {
    this._loading.next(true);
    this._error.next(null);

    // TODO: Replace with actual API call once service is generated
    return of([]).pipe(
      map((offices: any[]) =>
        offices.map(office => new CoordinationOffice(office)).sort((a, b) => a.pin.localeCompare(b.pin))
      ),
      catchError(error => {
        this._error.next('Failed to load coordination offices');
        console.error('Error loading coordination offices:', error);
        return of([]);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  createCoordinationOffice(office: Partial<CoordinationOfficeModel>): Observable<CoordinationOffice | null> {
    this._loading.next(true);
    this._error.next(null);

    // TODO: Replace with actual API call once service is generated
    return of(null).pipe(
      map((createdOffice: any) => createdOffice ? new CoordinationOffice(createdOffice) : null),
      catchError(error => {
        this._error.next('Failed to create coordination office');
        console.error('Error creating coordination office:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  updateCoordinationOffice(id: string, office: Partial<CoordinationOfficeModel>): Observable<CoordinationOffice | null> {
    this._loading.next(true);
    this._error.next(null);

    // TODO: Replace with actual API call once service is generated
    return of(null).pipe(
      map((updatedOffice: any) => updatedOffice ? new CoordinationOffice(updatedOffice) : null),
      catchError(error => {
        this._error.next('Failed to update coordination office');
        console.error('Error updating coordination office:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  deleteCoordinationOffice(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    // TODO: Replace with actual API call once service is generated
    return of(true).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete coordination office');
        console.error('Error deleting coordination office:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  verifyPin(pin: string): Observable<boolean> {
    // TODO: Replace with actual API call once service is generated
    return of(true).pipe(
      catchError(error => {
        console.error('Error verifying pin:', error);
        return of(false);
      })
    );
  }

  refreshCoordinationOffices(): void {
    this.loadCoordinationOffices().subscribe(offices => {
      this._coordinationOffices.next(offices);
    });
  }

  clearError(): void {
    this._error.next(null);
  }

  getCurrentCoordinationOffices(): CoordinationOffice[] {
    return this._coordinationOffices.value;
  }

  isLoading(): boolean {
    return this._loading.value;
  }
}