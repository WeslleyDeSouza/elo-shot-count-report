import { Module } from '@nestjs/common';
import { TenantConfigService } from './tenant-config.service';
import { UserConfigService } from './user-config.service';
import { TenantConfigController } from './tenant-config.controller';
import { UserConfigController } from './user-config.controller';
import {
ConfigModule as CoreConfigModule
} from '@app-galaxy/core-api';

@Module({
  controllers: [
    TenantConfigController,
    UserConfigController
  ],
  providers: [
    TenantConfigService,
    UserConfigService
  ],
  exports: [
    TenantConfigService,
    UserConfigService
  ],
  imports:[CoreConfigModule]
})
export class AppConfigModule {}
