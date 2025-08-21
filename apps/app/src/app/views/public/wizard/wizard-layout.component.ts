import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { WizardService } from './_common/services/wizard.service';
import { WIZARD_ROUTES } from './wizard.routes.constants';
import { TopbarComponent } from './_components';
import { filter } from 'rxjs';
import {Debounce} from "@app-galaxy/sdk-ui";

@Component({
  selector: 'app-wizard-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopbarComponent],
  template: `
    <div class="wizard-container">
      <app-topbar />
      <router-outlet />
    </div>
  `,
  styles: [`
    /* Layout Styles */
    .wizard-container {
      min-height: 100vh;
    }

    /* Global Wizard Styles */
    :host ::ng-deep {
      .min-vh-100 {
        min-height: 100vh;
      }

      .card {
        border: none;
        border-radius: 12px;
      }

      .form-control, .form-select {
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      .form-control:focus, .form-select:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      }

      .form-control-sm {
        font-size: 0.875rem;
      }

      .btn {
        border-radius: 8px;
      }

      .btn-group .btn {
        border-radius: 0;
      }

      .btn-group .btn:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }

      .btn-group .btn:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }

      .bg-light {
        background-color: #f8f9fa !important;
      }

      /* Progress Bar Styles */
      .progress {
        height: 4px;
        border-radius: 2px;
        background-color: #e9ecef;
      }

      .progress-bar {
        border-radius: 2px;
      }

      /* Table Styles */
      .table-responsive {
        border-radius: 8px;
      }

      .table th {
        border-top: none;
        font-weight: 600;
        font-size: 0.875rem;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .table td {
        vertical-align: middle;
      }

      .table-hover tbody tr:hover {
        background-color: rgba(0, 0, 0, 0.075);
      }

      /* Spinner Styles */
      .spinner-border-sm {
        width: 1rem;
        height: 1rem;
      }

      /* Icon Styles */
      .ri-sun-line, .ri-sun-fill {
        color: #ffc107;
      }

      .ri-moon-line {
        color: #17a2b8;
      }

      /* Badge Styles */
      .badge {
        border-radius: 6px;
      }

      /* Input Group Styles */
      .input-group .form-control:first-child,
      .input-group .form-select:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .input-group .form-control:last-child,
      .input-group .form-select:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      /* Alert Styles */
      .alert {
        border-radius: 8px;
      }

      /* Dark Mode */
      @media (prefers-color-scheme: dark) {
        .wizard-container {
          background-color: var(--bs-dark);
          color: var(--bs-light);
        }

        .card {
          background-color: var(--bs-dark);
          border: 1px solid var(--bs-gray-800);
        }

        .bg-light {
          background-color: var(--bs-gray-800) !important;
        }

        .form-control, .form-select {
          background-color: var(--bs-gray-900);
          border-color: var(--bs-gray-700);
          color: var(--bs-light);
        }

        .form-control:focus, .form-select:focus {
          background-color: var(--bs-gray-900);
          border-color: #0d6efd;
          color: var(--bs-light);
        }

        .form-control::placeholder {
          color: var(--bs-gray-400);
        }

        .table {
          color: var(--bs-light);
        }

        .table th {
          color: var(--bs-gray-300);
          border-color: var(--bs-gray-700);
        }

        .table td {
          border-color: var(--bs-gray-700);
        }

        .table-hover tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.075);
        }

        .table-light {
          background-color: var(--bs-gray-800);
          color: var(--bs-light);
        }

        .progress {
          background-color: var(--bs-gray-800);
        }

        .text-muted {
          color: var(--bs-gray-400) !important;
        }

        .alert-info {
          background-color: rgba(13, 110, 253, 0.1);
          border-color: rgba(13, 110, 253, 0.2);
          color: #b6d7ff;
        }

        .alert-success {
          background-color: rgba(25, 135, 84, 0.1);
          border-color: rgba(25, 135, 84, 0.2);
          color: #a3cfbb;
        }

        .alert-warning {
          background-color: rgba(255, 193, 7, 0.1);
          border-color: rgba(255, 193, 7, 0.2);
          color: #ffda6a;
        }

        .alert-danger {
          background-color: rgba(220, 53, 69, 0.1);
          border-color: rgba(220, 53, 69, 0.2);
          color: #f1aeb5;
        }
      }
    }
  `]
})
export class WizardLayoutComponent implements OnInit {
  private router = inject(Router);
  private wizardService = inject(WizardService);

  ngOnInit(): void {
    // Check tenant identifier on route navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.checkHasTenantSelection());
  this.checkHasTenantSelection()
  }

  @Debounce(500)
  checkHasTenantSelection(): void{
    const currentIdentifier = this.wizardService.getTenantIdentifier();
    if ( !currentIdentifier && !this.router.url.includes('/admin') && this.router.url.includes(WIZARD_ROUTES.BASE) ) {
      this.router.navigate([WIZARD_ROUTES.BASE,WIZARD_ROUTES.TENANT_CHOOSER]);
      return;
    }
  }

}
