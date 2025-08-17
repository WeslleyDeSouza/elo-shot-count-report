import {Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, PrimaryGeneratedColumn} from 'typeorm';
import { TenantBaseEntity } from '@app-galaxy/core-api';
import { CoordinationOfficeEntity } from './coordination-office.entity';
import { AuthUserEntity } from '@movit/auth-api';

@Entity('coordination_office_users')
export class CoordinationOfficeUserEntity extends TenantBaseEntity {
 protected self = CoordinationOfficeUserEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'coordination_office_id' })
  coordinationOfficeId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ name: 'role', default: 'member' })
  role: string;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CoordinationOfficeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coordination_office_id' })
  coordinationOffice: CoordinationOfficeEntity;

  @ManyToOne(() => AuthUserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: AuthUserEntity;

  @BeforeInsert()
  protected async beforeInsert(): Promise<any> {
  }
}
