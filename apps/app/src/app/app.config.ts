import {
  inject,
  ApplicationConfig,
  importProvidersFrom,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core'

import { provideRouter } from '@angular/router'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes'

import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';

import { DecimalPipe } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser';
import {provideStoreDevtools} from "@ngrx/store-devtools";
import {provideQuillConfig} from "ngx-quill";
import {loadAuthMod, loadLayoutMod} from "../mfe";
import { Store } from '@ngrx/store';
import { environment } from '../environments/environment';
import {provideServiceWorker, ServiceWorkerModule} from "@angular/service-worker";
import {provideTranslate} from "@app-galaxy/translate-ui";
import { provideServiceWorkerProviderUtils, ServiceWorkerUpdateService } from '@app-galaxy/sdk-ui';

export const appConfig: ApplicationConfig = {
  providers: [
    DecimalPipe,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    importProvidersFrom(BrowserAnimationsModule, BrowserModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),

    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    provideQuillConfig({}),
    provideTranslate({
      initialLocalesFiles:[
        environment.mfe.shell +'/assets/locales/[LOCALE]/auth.locale.json',
        environment.mfe.shell +'/assets/locales/[LOCALE]/global.locale.json',
        environment.mfe.shell +'/assets/locales/[LOCALE]/setting.locale.json',
        'global'
      ]
    }),

    // FakeBackendProvider,
    // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable'
    }),
    ServiceWorkerUpdateService,

    provideAppInitializer(async () => {
      const store = inject(Store)
      const [coreLayoutMod, authMod] = await Promise.all([
        loadLayoutMod(),
        loadAuthMod(),
      ]);

      if(!coreLayoutMod.changeLayoutState)console.log('coreLayoutMod.changeLayoutState not found',coreLayoutMod)
      if( !coreLayoutMod.changeLayoutState )return;

      const config = coreLayoutMod.getStoredLocalConfig();
      store.dispatch(coreLayoutMod.changeLayoutState({config: config?.layout || {}}))

      if(!authMod.changeLayoutState)console.log('authMod.changeLayoutState not found',authMod)
      store.dispatch(authMod.changeLayoutState({config: config?.auth || {}}))
    }),
    provideServiceWorkerProviderUtils({enabled:!!environment.production})

  ]
}
