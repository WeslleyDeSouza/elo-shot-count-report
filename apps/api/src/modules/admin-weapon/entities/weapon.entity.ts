import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WeaponCategoryEntity } from './weapon-category.entity';
import { DbPlatformColumn, TenantBaseEntity } from '@app-galaxy/core-api';

@Entity('weapon')
@Unique(['tenantId', 'categoryId', 'name'])
export class WeaponEntity extends TenantBaseEntity {
  protected self = WeaponEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbPlatformColumn({ type: 'uuid', nullable: false })
  categoryId: string;

  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @DbPlatformColumn({ length: 70, nullable: true })
  nameDe: string;

  @DbPlatformColumn({ length: 70, nullable: true })
  nameFr: string;

  @DbPlatformColumn({ length: 70, nullable: true })
  nameIt: string;

  @ManyToOne(() => WeaponCategoryEntity, (cat) => cat.weapons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenantId' ,referencedColumnName: 'tenantId' },
    { name: 'categoryId' ,referencedColumnName: 'id' }
  ])
  category: WeaponCategoryEntity;

  @DbPlatformColumn({ type: 'boolean', nullable: true, default: true })
  enabled: boolean;

  @DbPlatformColumn({ type: 'boolean', nullable: true, default: false })
  inWeight: boolean;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
    // Add any before insert logic here
  }
}
