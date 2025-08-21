import {Component, signal, computed, OnInit, OnDestroy, inject, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinationOfficeFacade } from '../coordination-office.facade';
import { CoordinationOffice } from '../coordination-office.model';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { Router } from '@angular/router';
import {EmptyStateComponent} from "../../_components";

@Component({
  selector: 'app-coordination-office',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    EmptyStateComponent
  ],
  templateUrl: './coordination-office.component.html',
  styles: `
    .office-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

  `
})
export class CoordinationOfficeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private facade = inject(CoordinationOfficeFacade);
  private router = inject(Router);

  allOffices = signal<CoordinationOffice[]>([]);
  searchText = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  sortField = signal<keyof CoordinationOffice>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  title = "Coordination Office";
  subTitle = "Coordination Offices";

  filteredOffices: Signal<CoordinationOffice[]> = computed(() => {
    let offices = this.allOffices();
    const search = this.searchText().toLowerCase();
    const field = this.sortField();
    const direction = this.sortDirection();

    // Filter by search text
    if (search) {
      offices = offices.filter(office =>
        office.name.toLowerCase().includes(search) ||
        office.pin.toLowerCase().includes(search) ||
        office.email.toLowerCase().includes(search)
      );
    }

    // Sort offices
    return offices.sort((a, b) => {
      const aValue = a[field]?.toString().toLowerCase() ?? '';
      const bValue = b[field]?.toString().toLowerCase() ?? '';

      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  ngOnInit(): void {
    this.setupFacadeSubscriptions();
    this.loadOffices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFacadeSubscriptions(): void {
    this.facade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading.set(loading));

    this.facade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error.set(error));
  }

  private loadOffices(): void {
    this.facade.loadCoordinationOffices()
      .pipe(takeUntil(this.destroy$))
      .subscribe(offices => {
        this.allOffices.set(offices);
      });
  }

  searchOffices(event: any): void {
    this.searchText.set(event.target.value);
  }

  refreshOffices(): void {
    this.facade.refreshCoordinationOffices();
    this.loadOffices();
  }

  clearError(): void {
    this.facade.clearError();
  }

  createCoordinationOffice(): void {
    this.router.navigate(['/admin/coordination-office/create']);
  }

  editCoordinationOffice(office: CoordinationOffice): void {
    this.router.navigate(['/admin/coordination-office/edit', office.id]);
  }

  deleteCoordinationOffice(office: CoordinationOffice): void {
    if (confirm(`Are you sure you want to delete ${office.displayName}?`)) {
      this.facade.deleteCoordinationOffice(office.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(success => {
          if (success) {
            this.loadOffices();
          }
        });
    }
  }

  toggleOfficeEnabled(office: CoordinationOffice): void {
    const updatedOffice = { ...office, enabled: !office.enabled };
    this.facade.updateCoordinationOffice(office.id, updatedOffice)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.loadOffices();
        }
      });
  }

  sortBy(field: keyof CoordinationOffice): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(field: keyof CoordinationOffice): string {
    if (this.sortField() !== field) {
      return 'ri-arrow-up-down-line';
    }
    return this.sortDirection() === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  }
}
