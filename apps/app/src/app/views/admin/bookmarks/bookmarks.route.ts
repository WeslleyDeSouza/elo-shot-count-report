import type { Route } from '@angular/router'
import { BookmarksComponent } from "./overview/bookmarks.component";
import { BookmarksFacade } from "./bookmarks.facade";

export const BOOKMARKS_ROUTES: Route[] = [
  {
    path: "",
    providers: [BookmarksFacade],
    children: [
      {
        path: 'overview',
        component: BookmarksComponent
      },
      // TODO: Add create and edit routes when forms are implemented
      // {
      //   path: 'create',
      //   component: BookmarkFormComponent
      // },
      // {
      //   path: 'edit/:id',
      //   component: BookmarkFormComponent
      // },
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      }
    ]
  }
]