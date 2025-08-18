import type { Route } from '@angular/router'
import { CollectionComponent } from "./overview/collection.component";
import { CollectionCreateComponent } from "./create/collection-create.component";
import { CollectionEditComponent } from "./edit/collection-edit.component";
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
        component: CollectionCreateComponent
      },
      {
        path: 'edit/:id',
        component: CollectionEditComponent
      },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]
