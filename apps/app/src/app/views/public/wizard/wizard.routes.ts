import type { Route } from '@angular/router';
import { LocaleResolver } from "@app-galaxy/translate-ui";
import {WizardService} from "./_common/services/wizard.service";
import {TenantChooserComponent} from "./steps/tenant-chooser/tenant-chooser.component";
import { WIZARD_ROUTES as WIZARD_ROUTE_PATHS } from './wizard.routes.constants';

export const WIZARD_ROUTES: Route[] = [
  {
    path: '',
    data: { path: "wizard" },
    resolve: LocaleResolver.default,
    loadComponent: () => import('./wizard-layout.component').then(c => c.WizardLayoutComponent),
    children: [
      {
        path: WIZARD_ROUTE_PATHS.LOGIN,
        loadComponent: () => import('./steps/login/wizard-login.component').then(c => c.WizardLoginComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.DATE_TIME,
        loadComponent: () => import('./steps/date-time/wizard-date-time.component').then(c => c.WizardDateTimeComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.LOCATIONS,
        loadComponent: () => import('./steps/locations/wizard-locations.component').then(c => c.WizardLocationsComponent)
      },
      // Legacy routes - will be removed
      {
        path: WIZARD_ROUTE_PATHS.DATE_LOCATION,
        loadComponent: () => import('./steps/date-location/wizard-date-location.component').then(c => c.WizardDateLocationComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.AMMUNITION,
        loadComponent: () => import('./steps/ammunition/wizard-ammunition.component').then(c => c.WizardAmmunitionComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.SUMMARY,
        loadComponent: () => import('./steps/summary/wizard-summary.component').then(c => c.WizardSummaryComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.SUCCESS,
        loadComponent: () => import('./steps/success/wizard-success.component').then(c => c.WizardSuccessComponent)
      },
      {
        path: WIZARD_ROUTE_PATHS.TENANT_CHOOSER,
        component:TenantChooserComponent
      },
      {
        path: '',
        redirectTo: WIZARD_ROUTE_PATHS.LOGIN,
        pathMatch: 'full'
      },
    ],
    providers:[WizardService]
  }
];
