import type { Route } from '@angular/router'
import { ArealComponent } from "./overview/areal.component";
import { ArealFacade } from "./areal.facade";
import { ArealFormComponent } from "./form/areal-form.component";
import { ArealCategoryFormComponent } from "./form/areal-category-form.component";
import { ArealBulkFormComponent } from "./form/areal-bulk-form.component";

export const AREAL_ROUTES: Route[] = [
  {
    path: "",
    providers: [ArealFacade],
    children: [
      {
        path: 'overview',
        component: ArealComponent
      },
      {
        path: 'create',
        component: ArealFormComponent
      },
      {
        path: 'create-category',
        component: ArealCategoryFormComponent
      },
      {
        path: 'edit/:id',
        component: ArealFormComponent
      },
      {
        path: 'edit-category/:id',
        component: ArealCategoryFormComponent
      },
      {
        path: 'bulk-edit',
        component: ArealBulkFormComponent
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]