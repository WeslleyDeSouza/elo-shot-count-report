import type { Route } from '@angular/router'
import { NxWelcome } from './nx-welcome';
import {LocaleResolver} from "@app-galaxy/translate-ui";

export const VIEWS_ROUTES: Route[] = [
    {
      path:'bookmarks',
      loadChildren:()=> import('./bookmarks')
        .then(mod => mod.BOOKMARKS_ROUTES),
      data: { path: "bookmark" },
      resolve: LocaleResolver.default,
    },

    // Modules

    {
      path:'**',
      component:NxWelcome
    }
].flat(2)
