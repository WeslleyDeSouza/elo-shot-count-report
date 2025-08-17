import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Unique } from 'typeorm';
import { DbPlatformColumn } from '@app-galaxy/core-api';

@Entity('areal_category_weapon')
@Unique(['categoryId', 'weaponId'])
export class AreaCategoryWeaponLinkEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  private id: number;

  @DbPlatformColumn({ type: 'uuid' })
  categoryId: string;

  @DbPlatformColumn({ type: 'uuid' })
  weaponId: string;
}
