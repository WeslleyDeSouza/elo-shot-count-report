import type { Route } from '@angular/router';
import { LocaleResolver } from "@app-galaxy/translate-ui";
import {WizardService} from "./_common/services/wizard.service";
import {TenantChooserComponent} from "./steps/tenant-chooser/tenant-chooser.component";

export const WIZARD_ROUTES: Route[] = [
  {
    path: '',
    data: { path: "wizard" },
    resolve: LocaleResolver.default,
    loadComponent: () => import('./wizard-layout.component').then(c => c.WizardLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./steps/login/wizard-login.component').then(c => c.WizardLoginComponent)
      },
      {
        path: 'date-location',
        loadComponent: () => import('./steps/date-location/wizard-date-location.component').then(c => c.WizardDateLocationComponent)
      },
      {
        path: 'ammunition',
        loadComponent: () => import('./steps/ammunition/wizard-ammunition.component').then(c => c.WizardAmmunitionComponent)
      },
      {
        path: 'summary',
        loadComponent: () => import('./steps/summary/wizard-summary.component').then(c => c.WizardSummaryComponent)
      },
      {
        path: 'success',
        loadComponent: () => import('./steps/success/wizard-success.component').then(c => c.WizardSuccessComponent)
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
