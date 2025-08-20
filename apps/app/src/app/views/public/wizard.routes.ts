import type { Route } from '@angular/router';
import { LocaleResolver } from "@app-galaxy/translate-ui";
import {WizardService} from "./wizard/services/wizard.service";
import {TenantChooserComponent} from "./wizard/steps/tenant-chooser/tenant-chooser.component";

export const WIZARD_ROUTES: Route[] = [
  {
    path: '',
    data: { path: "wizard" },
    resolve: LocaleResolver.default,
    loadComponent: () => import('./wizard/wizard-layout.component').then(c => c.WizardLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./wizard/steps/login/wizard-login.component').then(c => c.WizardLoginComponent)
      },
      {
        path: 'date-location',
        loadComponent: () => import('./wizard/steps/date-location/wizard-date-location.component').then(c => c.WizardDateLocationComponent)
      },
      {
        path: 'ammunition',
        loadComponent: () => import('./wizard/steps/ammunition/wizard-ammunition.component').then(c => c.WizardAmmunitionComponent)
      },
      {
        path: 'summary',
        loadComponent: () => import('./wizard/steps/summary/wizard-summary.component').then(c => c.WizardSummaryComponent)
      },
      {
        path: 'success',
        loadComponent: () => import('./wizard/steps/success/wizard-success.component').then(c => c.WizardSuccessComponent)
      },
      {
        path: 'tenant-chooser',
        component:TenantChooserComponent
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
    ],
    providers:[WizardService]
  }
];
