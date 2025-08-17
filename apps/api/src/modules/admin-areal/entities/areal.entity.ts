import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AreaCategoryEntity } from './areal-category.entity';
import { DbPlatformColumn } from '@app-galaxy/core-api';

@Entity('areal')
@Unique(['categoryId', 'name'])
export class AreaEntity extends BaseEntity {
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
  @JoinColumn({ name: 'categoryId' })
  category: AreaCategoryEntity;

  @ApiProperty()
  @DbPlatformColumn({ type: 'boolean', nullable: true, default: 0 })
  enabled: boolean;
}
