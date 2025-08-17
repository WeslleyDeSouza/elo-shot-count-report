import {
  env,
  createSourceOptions,
  ConfigModule as CoreConfigModule,
  TenantModule,
  TenantAdminModule,
  TenantAuthModuleWithRouting,
  TenantAdminModuleWithRouting,
  TenantAppConfigModule,
  TenantAppConfigWithRoutingModule,
  TenantAppPublicConfigWithRoutingModule
} from '@app-galaxy/core-api';

import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import * as process from 'node:process';

import {
  AuthUserAdminWithRoutingModule,
  AuthUserSessionWithRoutingModule,
  AuthUserModule,
  AuthRoleWithRoutingModule,
  AuthRoleModule,
  AuthUserAdminSelfWithRoutingModule,
  AuthRoleAdminWithRoutingModule,
  AuthUserInvitationWithRoutingModule,
  AuthAppAdminWithRoutingModule
} from '@movit/auth-api';

import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { API_MOCK_DATA } from './main.mock-data';

import {BookmarkModule} from "./modules";
import {UploadFTPModule} from "./modules";
import {HealthModule} from "./core";
import {CoreStaticFileModule} from "./core/static-file";
import {AppConfigModule} from "./core/config";
import {AreaModule} from "./modules/admin-areal";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...createSourceOptions(process.env['APP_NAME']),
      logging: +(process.env['DB_LOG'] || process.env['LOG_DB']) >= 1,
      logger: 'simple-console',
      autoLoadEntities: false,
      synchronize: true,
      ssl: false,
      extra:{
        connectionLimit: 40,
      },
      entities: [
        ...(<any>CoreConfigModule.dbSettings.entities),
        // User
        ...(<any>AuthUserModule.dbSettingsWithTemplate.entities),
        ...(<any>AuthRoleModule.dbSettings.entities),
        ...(<any>AuthUserAdminWithRoutingModule.dbSettings.entities),
        ...(<any>AuthUserInvitationWithRoutingModule.dbSettings.entities),
        // Tenant
        ...(<any>TenantModule.dbSettings.entities),
        ...(<any>TenantAdminModule.dbSettings.entities),
        ...(<any>TenantAppConfigModule.dbSettings.entities),
        // Mods
        ...  (<any>BookmarkModule.DBOptions.entities),
        ...  (<any>AreaModule.DBOptions.entities),
      ],
    }),

    CoreStaticFileModule,
    CoreConfigModule,
    HealthModule,
    AppConfigModule,

    // Auth & Admin Section
    AuthRoleWithRoutingModule,
    AuthUserSessionWithRoutingModule,
    AuthUserAdminWithRoutingModule,
    AuthUserAdminSelfWithRoutingModule,
    AuthRoleAdminWithRoutingModule,
    AuthUserInvitationWithRoutingModule,
    AuthAppAdminWithRoutingModule,

    // Tenant
    TenantModule,
    TenantAuthModuleWithRouting,
    TenantAdminModuleWithRouting,
    TenantAppConfigWithRoutingModule,
    TenantAppPublicConfigWithRoutingModule,

    // Modules - Main
    BookmarkModule,
    UploadFTPModule,
  ],
})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer):void  {}

  constructor(protected t: DataSource) {
    if ( !env.isProd() ) {
      setTimeout(
        ()=> API_MOCK_DATA.initMockData(t.manager.connection), 2000
      )
    }

  }
}
