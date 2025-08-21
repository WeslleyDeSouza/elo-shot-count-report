import {BaseEntity, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';

import { Unique } from 'typeorm';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';
import { AreaEntity } from './areal.entity';

@Entity('areal_weapon')
@Unique(['tenantId', 'id'])
@Unique(['tenantId','arealId'])
@Unique(['tenantId','arealId', 'weaponId'])
export class ArealWeaponLinkEntity extends TenantBaseEntity {
  protected self  = ArealWeaponLinkEntity;

  @PrimaryGeneratedColumn('increment')
  private id: number;

  @DbPlatformColumn({ type: 'uuid' })
  arealId: string;

  @DbPlatformColumn({ type: 'uuid' })
  weaponId: string;

  @ManyToOne(() => AreaEntity, (area) => area.weaponLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenantId', referencedColumnName: 'tenantId' },
    { name: 'arealId', referencedColumnName: 'id' },
  ])
  areal: AreaEntity;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {

  }
}
