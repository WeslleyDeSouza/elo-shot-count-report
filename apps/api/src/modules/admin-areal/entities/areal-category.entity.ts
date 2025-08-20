import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AreaEntity } from './areal.entity';
import { Unique } from 'typeorm';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';

@Entity('areal_category')
@Unique(['tenantId','id'])
@Unique(['tenantId','code', 'name'])
export class AreaCategoryEntity extends TenantBaseEntity {

  protected readonly self = AreaCategoryEntity

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @DbPlatformColumn({ type: 'double', nullable: false })
  code: string;

  @DbPlatformColumn({ type: 'boolean', nullable: true, default:true })
  enabled: boolean;

  @OneToMany(() => AreaEntity, (aE) => aE.category)
  areas: AreaEntity[];

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {

  }
}
