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
    path:'admin/areal',
    loadChildren:()=> import('./admin/areal')
      .then(mod => mod.AREAL_ROUTES),
    data: { path: "areal" },
    resolve: LocaleResolver.default,
  },
  {
    path:'admin/coordination-office',
    loadChildren:()=> import('./admin/coordination-office')
      .then(mod => mod.COORDINATION_OFFICE_ROUTES),
    data: { path: "coordination-office" },
    resolve: LocaleResolver.default,
  },
  {
    path:'admin/weapon',
    loadChildren:()=> import('./admin/weapon')
      .then(mod => mod.WEAPON_ROUTES),
    data: { path: "weapon" },
    resolve: LocaleResolver.default,
  },
    {
      path:'**',
      component:NxWelcome
    }
].flat(2)
