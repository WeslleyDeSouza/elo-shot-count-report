import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaEntity } from './entities/areal.entity';
import { Repository } from 'typeorm';
import { AreaCategoryEntity } from './entities/areal-category.entity';
import { AreaCategoryWeaponLinkEntity } from './entities/areal-category.weapon.entity';

@Injectable()
export class AreaWeaponLinkService {
  constructor(
    @InjectRepository(AreaCategoryWeaponLinkEntity)
    protected areaCatWeaponLinkRepo: Repository<AreaCategoryWeaponLinkEntity>
  ) {}
  getLinkFromAreal(categoryId: string) {
    return this.areaCatWeaponLinkRepo
      .find({
        where: {
          categoryId: categoryId,
        },
      })
      .then((rows) => rows.map((rows) => rows.weaponId));
  }

  deleteByWeapon(weaponId) {
    return this.areaCatWeaponLinkRepo.delete({
      weaponId: weaponId,
    });
  }
  link(categoryId, weaponId) {
    return this.areaCatWeaponLinkRepo
      .createQueryBuilder()
      .insert()
      .into(AreaCategoryWeaponLinkEntity)
      .values({
        categoryId: categoryId,
        weaponId: weaponId,
      })
      .orIgnore()
      .execute();
  }
  unLink(categoryId, weaponId) {
    this.areaCatWeaponLinkRepo
      .createQueryBuilder()
      .delete()
      .where({
        categoryId: categoryId,
        weaponId: weaponId,
      })
      .execute();
  }
}
