import {
  BaseEntity, BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AreaCategoryEntity } from './areal-category.entity';
import { ArealWeaponLinkEntity } from './areal-category.weapon.entity';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';

@Entity('areal')
@Unique(['tenantId', 'id'])
@Unique(['tenantId', 'categoryId', 'name'])
export class AreaEntity extends TenantBaseEntity {
  protected self = AreaEntity;

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
  @ManyToOne(() => AreaCategoryEntity, (cat) => cat.areas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenantId' ,referencedColumnName: 'tenantId' },
    { name: 'categoryId' ,referencedColumnName: 'id' },
  ])
  category: AreaCategoryEntity;

  @ApiProperty()
  @DbPlatformColumn({ type: 'boolean', nullable: true, default: 0 })
  enabled: boolean;

  @OneToMany(() => ArealWeaponLinkEntity, (link) => link.areal)
  weaponLinks: ArealWeaponLinkEntity[];

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {

  }
}
