import { Router, Routes } from '@angular/router';
import { inject, Injector } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { MenuUtils } from "./common";
import { Store } from "@ngrx/store";
import { loadAuthMod, loadLayoutMod, RemoteModules } from "../mfe";

export const routes: Routes = [
  {
    path:'',
    loadChildren: () =>import('./views/').then((mod) => mod.VIEWS_PUBLIC_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () =>
      loadAuthMod()
        .then((m) => m.authRoutes(m.VIEWS_ROUTES))
  },
  {
    path: '',
    children: [{
        path: '',
        loadChildren: () => loadLayoutMod()
          .then((m) => m.layoutRoutes({
            admin:    {
              path: 'admin',
              loadChildren: () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.ADMIN)
                .then((m) => m.VIEWS_ROUTES)
            },
            setting:  {
              path: 'settings',
              loadChildren: () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.SETTING)
                .then((m) => m.VIEWS_ROUTES)
            },
            settingTemplate: {
              path: 'template-builder',
              loadChildren: () => loadRemoteModule(RemoteModules.TEMPLATE_BUILDER_NAME, RemoteModules.TEMPLATE_BUILDER)
                .then((m) => m.VIEWS_ROUTES)
            },
            main: {
              path: '',
              routes: import('./views/').then((mod) => mod.VIEWS_ROUTES)
            },
          }))
      }],
    canActivate: [
      async (url: any) => {

        const injector = inject(Injector);
        const auth = await loadAuthMod();

        const session: any = injector.get(auth.AuthSessionService);
        const router = injector.get(Router);

        console.log(session);

        // use session.isStoredSessionValid()
        if (!session.session?.valid || !localStorage.getItem('app.session')) {
          router.navigate(['/auth/login']);
          return false;
        }

        return !!session.session?.valid;
      }
    ],
    resolve: {
      menu: ()=> MenuUtils.loadAndDispatch(inject(Store), loadLayoutMod),
    },
    loadComponent: ()=> import('./views/views.layout').then(comp => comp.ViewsLayout)
  }
  /*
     {
        path: '',
        component: MainLayoutComponent,
        loadChildren: () =>
            import('./views/layout-pages/layout.route').then((mod) => mod.LAYOUT_ROUTES),
    },
    {
        path: '',
        component: HorizontalLayoutComponent,
        loadChildren: () =>
            import('./views/layout-pages/horizontal/detached.route').then((mod) => mod.HORIZONTAL_ROUTE),
    },
    [AUTH_HERE]
    {
        path: '',
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./views/error-pages/error-pages.route').then(
                (mod) => mod.ERROR_PAGES_ROUTES
            ),
    },
    {
        path: '',
        loadChildren: () =>
            import('./views/other-pages/other-page.route').then(
                (mod) => mod.OTHER_ROUTES
            ),
    },
   * */
];
