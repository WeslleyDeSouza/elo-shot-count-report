import {
  BaseEntity,
  BeforeInsert,
  Entity,
  Index,Unique,
  PrimaryGeneratedColumn,DeleteDateColumn
} from 'typeorm';
import {DbPlatformColumn, TenantBaseEntity} from '@app-galaxy/core-api';

@Entity('boo_bookmark')
@Index(['tenantId'])
@Index(['refType'])
@Unique(['tenantId','createdBy','refType','refId'])
export class BookmarkEntity extends TenantBaseEntity {
  //@ts-ignore
  protected self: typeof BookmarkEntity = BookmarkEntity;

  @PrimaryGeneratedColumn('uuid')
  bookmarkId: string;

  @DbPlatformColumn({
    type: 'varchar',
    length: 50
  })
  title: string;

  @DbPlatformColumn({
    type: 'varchar',
    length: 100
  })
  refId: string;

  @DbPlatformColumn({
    type: 'varchar',
    length: 50
  })
  refType: string;

  @DbPlatformColumn({
    type: 'text'
  })
  url: string;

  @DbPlatformColumn({
    type: 'varchar',
    length: 100,
    nullable: true
  })
  category: string;

  @DbPlatformColumn({
    type: 'boolean',
    default: true
  })
  isPrivate: boolean;

  @DbPlatformColumn({
    type: 'uuid',
  })
  createdBy: string;

  @DbPlatformColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @BeforeInsert()
  async beforeInsert():Promise<any>{

  }
}
