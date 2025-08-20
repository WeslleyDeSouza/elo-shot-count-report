import type { Route } from '@angular/router'
import { NxWelcome } from './nx-welcome';
import {LocaleResolver} from "@app-galaxy/translate-ui";

export const VIEWS_PUBLIC_ROUTES: Route[] = [
  {
    path: '',
    data: { path: "public" },
    resolve: LocaleResolver.default,
    loadChildren: () => import('./public').then(mod => mod.WIZARD_ROUTES)
  },
]

export const VIEWS_ROUTES: Route[] = [
  {
    path:'bookmarks',
    loadChildren:()=> import('./admin/bookmarks')
      .then(mod => mod.BOOKMARKS_ROUTES),
    data: { path: "bookmark" },
    resolve: LocaleResolver.default,
  },
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
      {
        path:'collections',
        loadChildren:()=> import('./admin/collections')
          .then(mod => mod.COLLECTION_ROUTES),
      },
    ]
  },
].flat(2)
