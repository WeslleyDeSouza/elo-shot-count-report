import {
  AfterLoad,
  BeforeInsert,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  BeforeUpdate,
  Unique, ManyToOne, JoinColumn
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { DbPlatformColumn, TenantBaseEntity } from '@app-galaxy/core-api';
import { EncryptionService } from '@api-elo/common';

//
import {AreaEntity,AreaCategoryEntity} from "../../admin-areal/entities";

@Entity('collection')
//@Unique(['tenantId', 'id'])
export class CollectionEntity extends TenantBaseEntity {
  protected self = CollectionEntity;

  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbPlatformColumn({ type: 'uuid', nullable: true })
  arealCategoryId: string;

  @DbPlatformColumn({ type: 'uuid', nullable: true })
  arealId: string;

  @DbPlatformColumn({ type: 'varchar', length: 3, nullable: false })
  userType: string;

  @DbPlatformColumn({ type: 'varchar', length: 25, nullable: false })
  pin: string;

  @DbPlatformColumn({ type: 'uuid', nullable: true })
  groupId: string;

  @DbPlatformColumn({ type: 'longtext', nullable: true })
  weapons: string;

  @DbPlatformColumn({ type: 'text', nullable: true })
  person: string;

  @DbPlatformColumn({ type: 'text', nullable: true })
  date: string;

  @DbPlatformColumn({ type: 'boolean', nullable: true, default: true })
  enabled: boolean;

  @ManyToOne(() => AreaCategoryEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
    //{ name: 'tenantId', referencedColumnName: 'tenantId' },
    { name: 'arealCategoryId', referencedColumnName: 'id' },
  ])
  arealCategory: AreaCategoryEntity;

  @ManyToOne(() => AreaEntity, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([
   // { name: 'tenantId', referencedColumnName: 'tenantId' },
    { name: 'arealId', referencedColumnName: 'id' },
  ])
  areal: AreaEntity;

  @CreateDateColumn()
  createdAt: Date | string;

  @CreateDateColumn()
  deletedAt: Date | string;

  public initialise(data: Partial<CollectionEntity>): CollectionEntity {
    Object.assign(this,data)
    return  this;
  }

  @BeforeInsert()
  @BeforeUpdate()
  protected async beforeInsert(): Promise<any> {

    if (typeof this.person!== 'string' &&  !!this.person) {
      this.person = JSON.stringify(this.person);
    }

    if (typeof this.date!== 'string' &&  !!this.date) {
      this.date = JSON.stringify(this.date);
    }

    if (typeof this.weapons !== 'string' &&  !!this.weapons) {
      this.weapons = JSON.stringify(this.weapons);
    }

    this.encryptDataBeforeSaving();
  }

  private encryptDataBeforeSaving(): void {
    this.person = EncryptionService.encrypt(this.person);
  }

  @AfterLoad()
  private decryptDataAfterLoad() {
    this.person = EncryptionService.decrypt(this.person);
    try {

      this.weapons = typeof this.weapons === 'string' && this.weapons?.length ? JSON.parse(this.weapons) : this.weapons;

      this.person = typeof this.person === 'string' && this.person?.length ? JSON.parse(this.person) : this.person;

      this.date = typeof this.date === 'string' && this.date?.length ? JSON.parse(this.date) : this.date;

    }catch (e){
      console.error('Error decrypting CollectionData: ', this.id,e);
    }
 }
}
