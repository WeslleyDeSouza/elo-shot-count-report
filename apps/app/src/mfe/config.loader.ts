import { loadRemoteModule, } from '@angular-architects/native-federation';
import { RemoteModules } from './config.remotes';

interface IConfig {
  reducer:any,
  actions?:any,
  storage?:any,
  reducerMeta?:any,
  provider(config?:any):any[],
}

const toRemote = (config:IConfig)=> (mod:any) =>  mod.toRemote(config)

const loadRemoteConfig = (name:string,path:string,config:any):Promise<IConfig> =>
  loadRemoteModule(name, path).then(toRemote(config))
    .catch((e)=> ({provider(){
    console.warn(`Module ${name} ${path} not found or has issues`)
      console.error(e.message);
    return []}}))

export const loadConfig = (config: {
  auth?:any,
  layout?:any
  admin?:any
  setting?:any
  templateBuilder?:any
} = {}) => {
  return Promise.all([
    // Shell
    loadRemoteConfig(RemoteModules.SHELL_NAME, RemoteModules.AUTH, config.auth),
    loadRemoteConfig(RemoteModules.SHELL_NAME, RemoteModules.LAYOUT, config.layout),
    loadRemoteConfig(RemoteModules.SHELL_NAME, RemoteModules.ADMIN, config.admin),
    loadRemoteConfig(RemoteModules.SHELL_NAME, RemoteModules.SETTING, config.setting),
    // Template Builder
    loadRemoteConfig(RemoteModules.TEMPLATE_BUILDER_NAME, RemoteModules.TEMPLATE_BUILDER, config.templateBuilder)
  ])
}

export const loadAuthMod = () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.AUTH);
export const loadLayoutMod = () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.LAYOUT);
export const loadAdminMod = () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.ADMIN);
export const loadSettingMod = () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.SETTING);
export const loadTemplateBuilderMod = () => loadRemoteModule(RemoteModules.TEMPLATE_BUILDER_NAME, RemoteModules.TEMPLATE_BUILDER);

// Alternative: Object with all loaders
export const ModuleLoaders = {
  loadAuth: () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.AUTH),
  loadLayout: () => loadRemoteModule(RemoteModules.SHELL_NAME, RemoteModules.LAYOUT),
  loadAdmin: () => loadAdminMod(),
  loadSetting: () => loadSettingMod(),
  loadTemplateBuilderMod: () => loadTemplateBuilderMod(),
};
