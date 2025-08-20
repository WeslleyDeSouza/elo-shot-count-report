import { Module } from '@nestjs/common';
import { WeaponService } from './weapon.service';
import DBOptions from './db/weapon.database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { WeaponEntity } from './entities/weapon.entity';
import { AdminWeaponController } from './controllers/admin-weapon.controller';
import { AdminWeaponCategoryController } from './controllers/admin-weapon-category.controller';

const MOD = {
  imports: [
    TypeOrmModule.forFeature([
      WeaponEntity,
      WeaponCategoryEntity,
    ]),
  ],
  providers: [WeaponService],
  exports: [WeaponService],
}

@Module(Object.assign(MOD, {
    controllers: [
      AdminWeaponController,
      AdminWeaponCategoryController,
    ]
  }))
export class WeaponModule {
  static DBOptions = DBOptions;
}

@Module(MOD)
export class WeaponModuleSimple {
  static DBOptions = DBOptions;
}
