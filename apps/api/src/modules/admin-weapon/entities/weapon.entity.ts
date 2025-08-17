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

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'uuid', nullable: false })
  categoryId: string;

  @ApiProperty()
  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @ApiProperty()
  @DbPlatformColumn({ length: 70, nullable: true })
  nameDe: string;

  @ApiProperty()
  @DbPlatformColumn({ length: 70, nullable: true })
  nameFr: string;

  @ApiProperty()
  @DbPlatformColumn({ length: 70, nullable: true })
  nameIt: string;

  @ApiProperty()
  @ManyToOne(() => WeaponCategoryEntity, (cat) => cat.weapons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'tenantId' }, { name: 'categoryId' }])
  category: WeaponCategoryEntity;

  @ApiProperty()
  @DbPlatformColumn({ type: 'boolean', nullable: true, default: true })
  enabled: boolean;

  @ApiProperty()
  @DbPlatformColumn({ type: 'boolean', nullable: true, default: false })
  inWeight: boolean;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
    // Add any before insert logic here
  }
}