import {inject, Injectable} from "@angular/core";
import { Observable, BehaviorSubject, map, catchError, of, finalize } from "rxjs";
import { CoordinationOffice } from "./coordination-office.model";
import { AdminCoordinationOfficeService } from "@ui-elo/apiClient";

/**
 * Facade service for managing coordination office operations.
 * Provides a simplified interface for coordination office CRUD operations
 * with loading states and error handling.
 */
@Injectable()
export class CoordinationOfficeFacade {
  // Internal state management
  private _loading = new BehaviorSubject<boolean>(false);
  private _coordinationOffices = new BehaviorSubject<CoordinationOffice[]>([]);
  private _error = new BehaviorSubject<string | null>(null);

  // Public observables for component consumption
  public readonly loading$ = this._loading.asObservable();
  public readonly coordinationOffices$ = this._coordinationOffices.asObservable();
  public readonly error$ = this._error.asObservable();

  // Injected API service
  protected api = inject(AdminCoordinationOfficeService);

  /**
   * Loads all coordination offices from the server.
   * Offices are sorted by PIN in ascending order.
   * @returns Observable of coordination offices array
   */
  loadCoordinationOffices(): Observable<CoordinationOffice[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCoordinationOfficeListCoordinationOffices().pipe(
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

  /**
   * Creates a new coordination office.
   * @param office - Partial coordination office data for creation
   * @returns Observable of created office or null if failed
   */
  createCoordinationOffice(office: Partial<CoordinationOffice>): Observable<CoordinationOffice | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCoordinationOfficeCreateCoordinationOffice({
      body: office as any,
    }).pipe(
      map((createdOffice: any) => new CoordinationOffice(createdOffice)),
      catchError(error => {
        this._error.next('Failed to create coordination office');
        console.error('Error creating coordination office:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Updates an existing coordination office.
   * @param id - Office ID to update
   * @param office - Partial office data for update
   * @returns Observable of updated office or null if failed
   */
  updateCoordinationOffice(id: string, office: Partial<CoordinationOffice>): Observable<CoordinationOffice | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCoordinationOfficeUpdateCoordinationOffice({
      id: id,
      body: office as any,
    }).pipe(
      map((updatedOffice: any) => new CoordinationOffice(updatedOffice)),
      catchError(error => {
        this._error.next('Failed to update coordination office');
        console.error('Error updating coordination office:', error);
        return of(null);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Deletes a coordination office by ID.
   * @param id - Office ID to delete
   * @returns Observable boolean indicating success
   */
  deleteCoordinationOffice(id: string): Observable<boolean> {
    this._loading.next(true);
    this._error.next(null);

    return this.api.adminCoordinationOfficeDeleteCoordinationOffice({ id }).pipe(
      map(() => true),
      catchError(error => {
        this._error.next('Failed to delete coordination office');
        console.error('Error deleting coordination office:', error);
        return of(false);
      }),
      finalize(() => this._loading.next(false))
    );
  }

  /**
   * Verifies if a PIN exists and is valid.
   * @param pin - PIN to verify
   * @returns Observable boolean indicating if PIN is valid
   */
  verifyPin(pin: string): Observable<boolean> {
    return this.api.adminCoordinationOfficeVerifyCoordinationOffice({ pin }).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error verifying pin:', error);
        return of(false);
      })
    );
  }

  /**
   * Refreshes the coordination offices by reloading them from the server.
   * Updates the internal coordination offices state.
   */
  refreshCoordinationOffices(): void {
    this.loadCoordinationOffices().subscribe(offices => {
      this._coordinationOffices.next(offices);
    });
  }

  /**
   * Clears any current error state.
   */
  clearError(): void {
    this._error.next(null);
  }

  /**
   * Gets the current coordination offices without triggering a new load.
   * @returns Current coordination offices array
   */
  getCurrentCoordinationOffices(): CoordinationOffice[] {
    return this._coordinationOffices.value;
  }

  /**
   * Checks if any operation is currently loading.
   * @returns Current loading state
   */
  isLoading(): boolean {
    return this._loading.value;
  }
}
