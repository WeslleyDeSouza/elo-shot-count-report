import {BaseEntity, BeforeInsert, Entity, PrimaryGeneratedColumn} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {DbPlatformColumn, TenantBaseEntity, TenantEntity} from '@app-galaxy/core-api';

import { CoordinationOfficeModel } from '../dto/coordination-office.model';

@Entity('coordination_office')
export class CoordinationOfficeEntity extends TenantBaseEntity implements CoordinationOfficeModel {

  protected self = CoordinationOfficeEntity;

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'varchar', length: 25, nullable: false })
  name: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'varchar', length: 100, nullable: false })
  email: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'text',  nullable: true })
  imageUrl: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'varchar', length: 15, nullable: false })
  pin: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'varchar', length: 100, nullable: true })
  allowedArealNames: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'uuid', nullable: true })
  createdBy: string;

  @ApiProperty()
  @DbPlatformColumn({ type: 'boolean', nullable: true, default: true })
  enabled: boolean;

  static initialise(entity: Partial<CoordinationOfficeModel>): CoordinationOfficeModel {
    return Object.assign(new CoordinationOfficeEntity(), entity);
  }

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
  }
}
