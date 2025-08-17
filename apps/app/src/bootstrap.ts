import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideStore } from "@ngrx/store";
import { loadConfig, mfeConfig } from "./mfe";

loadConfig(mfeConfig)
  .then(([
            configAuth,
            configCore,
            configAdmin,
            configSetting,
            configTemplateBuilder
          ])=> {
    const defaultConfig = {
      actions:{
        auth:configAuth.actions?.auth
      },
      storage:{
        session:configAuth.storage?.session || (<any>configAuth).store?.auth,
      }
    }

    appConfig.providers = [
       appConfig.providers,
       provideStore({
        ... configAuth.reducer,
        ... configCore.reducer,
      }, { metaReducers: [configCore.reducerMeta ] }),
       configAuth.provider(),
       configCore.provider(defaultConfig),
       configAdmin.provider(defaultConfig),
       configSetting.provider(defaultConfig),
       configTemplateBuilder.provider(defaultConfig)
    ].flat(2);

    return appConfig;
})
  .then(config => bootstrapApplication( App, config )
    .catch((err) => console.error(err)))
