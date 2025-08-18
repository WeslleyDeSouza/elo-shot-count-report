import type { Route } from '@angular/router'
import { CollectionComponent } from "./overview/collection.component";
import { CollectionFormComponent } from "./form/collection-form.component";
import { CollectionFacade } from "./collection.facade";
import {CollectionArealService, CollectionWeaponService} from "./services";

export const COLLECTION_ROUTES: Route[] = [
  {
    path: "",
    providers: [CollectionFacade,CollectionWeaponService,CollectionArealService],
    children: [
      {
        path: 'overview',
        component: CollectionComponent
      },
      {
        path: 'create',
        component: CollectionFormComponent
      },
      {
        path: 'edit/:id',
        component: CollectionFormComponent
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]
