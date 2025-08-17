import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WeaponEntity } from './weapon.entity';
import { DbPlatformColumn, TenantBaseEntity } from '@app-galaxy/core-api';

@Entity('weapon_category')
@Unique(['tenantId', 'code', 'name'])
export class WeaponCategoryEntity extends TenantBaseEntity {
  protected readonly self = WeaponCategoryEntity;

  @ApiProperty({ type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String })
  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @ApiProperty({ type: Number })
  @DbPlatformColumn({ type: 'double', nullable: false })
  code: number;

  @ApiProperty({ type: WeaponEntity, isArray: true })
  @OneToMany(() => WeaponEntity, (weapon) => weapon.category)
  weapons: WeaponEntity[];

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
    // Add any before insert logic here
  }
}