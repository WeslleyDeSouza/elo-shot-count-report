import { Component, input, OnInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@app-galaxy/translate-ui';
import { CoordinationOfficeFacade } from '../coordination-office.facade';
import { Subject, takeUntil } from 'rxjs';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
}

@Component({
  selector: 'app-user-assignment',
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">{{ 'Assigned Users' | translate }}</h5>
      </div>
      <div class="card-body">
        @if(loading()) {
          <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        } @else if(error()) {
          <div class="alert alert-danger">
            {{ error() }}
          </div>
        } @else {
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ 'User' | translate }}</th>
                  <th class="text-end">
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-decoration-none"
                      (click)="toggleAllUsers()">
                      {{ 'Toggle All' | translate }}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                @for(user of availableUsers(); track user.userId) {
                  <tr>
                    <td>
                      <div class="d-flex align-items-center">
                        <div>
                          <div class="fw-medium">{{ user.firstName }} {{ user.lastName }}</div>
                          @if(user.email) {
                            <small class="text-muted">{{ user.email }}</small>
                          }
                        </div>
                      </div>
                    </td>
                    <td class="d-flex justify-content-end">
                      <div class="form-check form-switch">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          [id]="'user-' + user.userId"
                          [checked]="isUserAssigned(user.userId)"
                          [disabled]="isUserCreator(user.userId)"
                          (change)="toggleUserAssignment(user.userId, $event)">
                        <label class="form-check-label" [for]="'user-' + user.userId"></label>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if(availableUsers().length === 0) {
              <div class="text-center py-3 text-muted">
                <p>{{ 'No users available' | translate }}</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .card-title {
      color: #495057;
    }

    .table th {
      border-top: none;
      font-weight: 600;
    }

    .form-check-input:disabled {
      opacity: 0.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAssignmentComponent implements OnInit, OnDestroy {
  coordinationOfficeId = input<string>('');
  pin = input<string>('');

  private destroy$ = new Subject<void>();
  private facade = inject(CoordinationOfficeFacade);

  availableUsers = signal<User[]>([]);
  assignedUserIds = signal<Set<string>>(new Set());
  loading = signal(false);
  error = signal<string | null>(null);
  creatorUserId = signal<string>('');

  totalUsers = computed(() => this.availableUsers().length);
  assignedCount = computed(() => this.assignedUserIds().size);
  allUsersSelected = computed(() =>
    this.availableUsers().length > 0 &&
    this.availableUsers().every(user => this.isUserAssigned(user.userId) || this.isUserCreator(user.userId))
  );

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    if (!this.coordinationOfficeId()) return;

    this.loading.set(true);
    this.error.set(null);

    // Load all users
    this.facade.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.availableUsers.set(<any>users);
          this.loadAssignedUsers();
        },
        error: (error) => {
          this.error.set('Failed to load users');
          this.loading.set(false);
        }
      });
  }

  private loadAssignedUsers(): void {
    if (!this.pin()) {
      this.loading.set(false);
      return;
    }

    // Load assigned users by PIN
    this.facade.getUsersByPin(this.pin())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignedUsers) => {
          const assignedIds = new Set(assignedUsers.map((user:any) => user.userId));
          this.assignedUserIds.set(assignedIds);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set('Failed to load assigned users');
          this.loading.set(false);
        }
      });
  }

  isUserAssigned(userId: string): boolean {
    return this.assignedUserIds().has(userId);
  }

  isUserCreator(userId: string): boolean {
    return this.creatorUserId() === userId;
  }

  toggleUserAssignment(userId: string, event: any): void {
    const isAssigned = event.target.checked;

    if (isAssigned) {
      this.assignUser(userId);
    } else {
      this.unassignUser(userId);
    }
  }

  private assignUser(userId: string): void {
    this.facade.assignUserToCoordinationOffice(userId, this.coordinationOfficeId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const current = new Set(this.assignedUserIds());
          current.add(userId);
          this.assignedUserIds.set(current);
        },
        error: (error) => {
          this.error.set('Failed to assign user');
        }
      });
  }

  private unassignUser(userId: string): void {
    this.facade.unassignUserFromCoordinationOffice(userId, this.coordinationOfficeId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const current = new Set(this.assignedUserIds());
          current.delete(userId);
          this.assignedUserIds.set(current);
        },
        error: (error) => {
          this.error.set('Failed to unassign user');
        }
      });
  }

  toggleAllUsers(): void {
    const shouldAssignAll = !this.allUsersSelected();

    this.availableUsers().forEach(user => {
      if (this.isUserCreator(user.userId)) return; // Skip creator

      if (shouldAssignAll && !this.isUserAssigned(user.userId)) {
        this.assignUser(user.userId);
      } else if (!shouldAssignAll && this.isUserAssigned(user.userId)) {
        this.unassignUser(user.userId);
      }
    });
  }
}
