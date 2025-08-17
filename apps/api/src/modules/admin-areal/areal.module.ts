import { Module } from '@nestjs/common';
import { ArealService } from './areal.service';
import DBOptions from './db/areal.database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AreaCategoryEntity } from './entities/areal-category.entity';
import { AreaEntity } from './entities/areal.entity';
import { AreaWeaponLinkService } from './areal-weapon.service';
import { AreaCategoryWeaponLinkEntity } from './entities/areal-category.weapon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AreaEntity,
      AreaCategoryEntity,
      AreaCategoryWeaponLinkEntity,
    ]),
  ],
  providers: [ArealService, AreaWeaponLinkService],
  exports: [ArealService, AreaWeaponLinkService],
})
export class AreaModule {
  static DBOptions = DBOptions;
}
