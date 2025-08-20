import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinationOfficeService } from './coordination-office.service';
import { CoordinationOfficeUserService } from './coordination-office-user.service';
import DBOptions from './db/coordination-office.database';
import { CoordinationOfficeEntity } from './entities/coordination-office.entity';
import { CoordinationOfficeUserEntity } from './entities/coordination-office-user.entity';
import { AdminCoordinationOfficeController } from './controllers/admin-coordination-office.controller';
import { AuthUserEntity, AuthAdminService } from '@movit/auth-api';

@Module({
  imports: [
    TypeOrmModule.forFeature(<any>DBOptions.entities),
  ],
  controllers: [
    AdminCoordinationOfficeController,
  ],
  providers: [
    CoordinationOfficeService,
    CoordinationOfficeUserService,
    AuthAdminService
  ],
  exports: [
    CoordinationOfficeService,
    CoordinationOfficeUserService
  ],
})
export class CoordinationOfficeModule {
  static DBOptions = DBOptions;
}

@Module({
  imports: [
    TypeOrmModule.forFeature(<any>DBOptions.entities),
  ],
  providers: [
    CoordinationOfficeService,
    CoordinationOfficeUserService,
    AuthAdminService
  ],
  exports: [
    CoordinationOfficeService,
    CoordinationOfficeUserService
  ],
})
export class CoordinationOfficeModuleSimple {
  static DBOptions = DBOptions;
}
