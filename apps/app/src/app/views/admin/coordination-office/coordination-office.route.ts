import type { Route } from '@angular/router'
import { CoordinationOfficeComponent } from "./overview/coordination-office.component";
import { CoordinationOfficeFacade } from "./coordination-office.facade";
import { CoordinationOfficeFormComponent } from "./form/coordination-office-form.component";

export const COORDINATION_OFFICE_ROUTES: Route[] = [
  {
    path: "",
    providers: [CoordinationOfficeFacade],
    children: [
      {
        path: 'overview',
        component: CoordinationOfficeComponent
      },
      {
        path: 'create',
        component: CoordinationOfficeFormComponent
      },
      {
        path: 'edit/:id',
        component: CoordinationOfficeFormComponent
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]