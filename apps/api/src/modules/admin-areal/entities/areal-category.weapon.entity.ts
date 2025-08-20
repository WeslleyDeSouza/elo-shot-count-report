import {BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

import { Unique } from 'typeorm';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';

@Entity('areal_category_weapon')
@Unique(['tenantId', 'id'])
@Unique(['tenantId','categoryId', 'weaponId'])
export class AreaCategoryWeaponLinkEntity extends TenantBaseEntity {
  protected self  = AreaCategoryWeaponLinkEntity;

  @PrimaryGeneratedColumn('increment')
  private id: number;

  @DbPlatformColumn({ type: 'uuid' })
  categoryId: string;

  @DbPlatformColumn({ type: 'uuid' })
  weaponId: string;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {

  }
}
