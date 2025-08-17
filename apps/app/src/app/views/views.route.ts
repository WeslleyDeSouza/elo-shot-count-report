import type { Route } from '@angular/router'
import { NxWelcome } from './nx-welcome';
import {LocaleResolver} from "@app-galaxy/translate-ui";

export const VIEWS_ROUTES: Route[] = [
    {
      path:'bookmarks',
      loadChildren:()=> import('./admin/bookmarks')
        .then(mod => mod.BOOKMARKS_ROUTES),
      data: { path: "bookmark" },
      resolve: LocaleResolver.default,
    },
    // Non  Modules
  {
    path:'admin',
    data: { path: "admin" },
    resolve: LocaleResolver.default,
    children: [
      {
        path:'areal',
        loadChildren:()=> import('./admin/areal')
          .then(mod => mod.AREAL_ROUTES),
      },
      {
        path:'coordination-office',
        loadChildren:()=> import('./admin/coordination-office')
          .then(mod => mod.COORDINATION_OFFICE_ROUTES),
      },
      {
        path:'weapon',
        loadChildren:()=> import('./admin/weapon')
          .then(mod => mod.WEAPON_ROUTES),
      },
    ]
  }
,
    {
      path:'**',
      component:NxWelcome
    }
].flat(2)
