import {
  createTestSourceOptions,
  TenantEntity,
  TenantUserRoleEntity,
  TenantUserRoleStructureEntity,
  TestMockTenantMock
} from '@app-galaxy/core-api'
import { AuthUserEntity,
  AuthLoginEntity,
  } from '@movit/auth-api'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { DataSourceOptions } from 'typeorm'

const TenantDBOptionWithUser = {
  entities:[
    TenantEntity,
    AuthUserEntity,
    AuthLoginEntity,
    TenantUserRoleEntity,
    TenantUserRoleStructureEntity
  ]
}

let config:DataSourceOptions  = createTestSourceOptions({
  entities: TenantDBOptionWithUser.entities,
  logger:'simple-console',
  logging:false
});
export const jestTestSetup = (mods?:any[], customEntities:any[] = [] ) => {
  return [TypeOrmModule.forRoot(config), TypeOrmModule.forFeature([<any>config.entities, customEntities].flat(2)), ...(mods || [])];
};

export const jestTestSetupBeforeEach = async (datasource: DataSource = new DataSource(config)) => {
  await TestMockTenantMock.fill.All(datasource)


  /*
  {
         userId:userId,
         email: process.env['APP_DEFAULT_USER'] || 'user@mail.com',
         password: process.env['APP_DEFAULT_PASSWORD'] || 'user@mail.com',
         pin:'1234'
   }
  * */

  /* Simple User */
  await datasource.query('insert into auth_user (userId, email, host,password, pin, salt, authCreatedAt)' +
    'values (?,?,?,?,?,?,?)',[
    process.env['APP_DEFAULT_USER_ID'] || '28b1e864-7eac-4112-9497-7e7373c3fa66',
    process.env['APP_DEFAULT_USER'] || 'user@mail.com',
    (process.env['APP_DEFAULT_USER'] || 'user@mail.com').split('@')[1],
    process.env['APP_DEFAULT_PASSWORD'] || 'user@mail.com',
    '1234',
    '1234@test',
    new Date().getFullYear()
  ])
};


