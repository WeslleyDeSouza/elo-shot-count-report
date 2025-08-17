import type { Route } from '@angular/router'
import { WeaponComponent } from "./overview/weapon.component";
import { WeaponFacade } from "./weapon.facade";
import { WeaponFormComponent } from "./form";
import { WeaponCategoryFormComponent } from "./form";

export const WEAPON_ROUTES: Route[] = [
  {
    path: "",
    providers: [WeaponFacade],
    children: [
      {
        path: 'overview',
        component: WeaponComponent
      },
      {
        path: 'create',
        component: WeaponFormComponent
      },
      {
        path: 'create-category',
        component: WeaponCategoryFormComponent
      },
      {
        path: 'edit/:id',
        component: WeaponFormComponent
      },
      {
        path: 'edit-category/:id',
        component: WeaponCategoryFormComponent
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]
