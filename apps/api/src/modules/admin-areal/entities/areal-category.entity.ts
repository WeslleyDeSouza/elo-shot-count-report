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

  @ApiProperty({ type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String })
  @DbPlatformColumn({ length: 70, nullable: false })
  name: string;

  @ApiProperty({ type: String })
  @DbPlatformColumn({ type: 'double', nullable: false })
  code: string;

  @ApiProperty({ type: AreaEntity, isArray: true })
  @OneToMany(() => AreaEntity, (aE) => aE.category)
  areas: AreaEntity[];

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {

  }
}
