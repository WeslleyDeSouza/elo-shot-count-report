import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { WeaponEntity } from './weapon.entity';
import { DbPlatformColumn, TenantBaseEntity } from '@app-galaxy/core-api';

@Entity('weapon_category')
@Unique(['tenantId', 'id'])
@Unique(['tenantId', 'code', 'name'])
export class WeaponCategoryEntity extends TenantBaseEntity {
  protected readonly self = WeaponCategoryEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @DbPlatformColumn({ type: 'double', nullable: false })
  code: number;

  @OneToMany(() => WeaponEntity, (weapon) => weapon.category)
  weapons: WeaponEntity[];

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
    // Add any before insert logic here
  }
}
