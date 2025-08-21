import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArealWeaponLinkEntity } from './entities/areal-category.weapon.entity';

@Injectable()
export class AreaWeaponLinkService {
  constructor(
    @InjectRepository(ArealWeaponLinkEntity)
    protected areaCatWeaponLinkRepo: Repository<ArealWeaponLinkEntity>
  ) {}
  getLinkFromAreal(arealId: string) {
    return this.areaCatWeaponLinkRepo
      .find({
        where: {
          arealId: arealId,
        },
      })
      .then((rows) => rows.map((rows) => rows.weaponId));
  }

  deleteByWeapon(weaponId) {
    return this.areaCatWeaponLinkRepo.delete({
      weaponId: weaponId,
    });
  }
  link(arealId, weaponId) {
    return this.areaCatWeaponLinkRepo
      .createQueryBuilder()
      .insert()
      .into(ArealWeaponLinkEntity)
      .values({
        arealId: arealId,
        weaponId: weaponId,
      })
      .orIgnore()
      .execute();
  }
  unLink(arealId, weaponId) {
    this.areaCatWeaponLinkRepo
      .createQueryBuilder()
      .delete()
      .where({
        arealId: arealId,
        weaponId: weaponId,
      })
      .execute();
  }
}
