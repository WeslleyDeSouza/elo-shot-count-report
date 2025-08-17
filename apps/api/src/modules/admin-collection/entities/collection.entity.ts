import {
  BaseEntity, BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AreaCategoryEntity } from '../../admin-areal/entities/areal-category.entity';
import { AreaEntity } from '../../admin-areal/entities/areal.entity';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';

@Entity('collection')
export class CollectionEntity extends TenantBaseEntity {
  protected self = CollectionEntity;

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbPlatformColumn({ type: 'uuid', nullable: false })
  arealCategoryId: string;

  @DbPlatformColumn({ type: 'uuid', nullable: false })
  arealId: string;

  @DbPlatformColumn({ type: 'varchar', length: 3, nullable: false })
  userType: string;

  @DbPlatformColumn({ type: 'varchar', length: 25, nullable: false })
  pin: string;

  @DbPlatformColumn({ type: 'longtext', nullable: true })
  weapons: string;

  @DbPlatformColumn({ type: 'text', nullable: true })
  person: string;

  @DbPlatformColumn({ type: 'text', nullable: true })
  date: string;

  @DbPlatformColumn({ type: 'boolean', nullable: true, default: true })
  enabled: boolean;

  @ManyToOne(() => AreaCategoryEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenantId', referencedColumnName: 'tenantId' },
    { name: 'arealCategoryId', referencedColumnName: 'id' },
  ])
  arealCategory: AreaCategoryEntity;

  @ManyToOne(() => AreaEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'tenantId', referencedColumnName: 'tenantId' },
    { name: 'arealId', referencedColumnName: 'id' },
  ])
  areal: AreaEntity;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
    // Any pre-insert logic if needed
  }
}
