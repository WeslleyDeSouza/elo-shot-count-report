import { Module } from '@nestjs/common';
import { WeaponService } from './weapon.service';
import DBOptions from './db/weapon.database';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeaponCategoryEntity } from './entities/weapon-category.entity';
import { WeaponEntity } from './entities/weapon.entity';
import { AdminWeaponController } from './controllers/admin-weapon.controller';
import { AdminWeaponCategoryController } from './controllers/admin-weapon-category.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WeaponEntity,
      WeaponCategoryEntity,
    ]),
  ],
  controllers: [
    AdminWeaponController,
    AdminWeaponCategoryController,
  ],
  providers: [WeaponService],
  exports: [WeaponService],
})
export class WeaponModule {
  static DBOptions = DBOptions;
}