import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinationOfficeEntity } from './entities/coordination-office.entity';
import { CoordinationOfficeUserService,  } from './coordination-office-user.service';
import {IAuthUser} from "@movit/auth-api";

@Injectable()
export class CoordinationOfficeService {
  constructor(
    @InjectRepository(CoordinationOfficeEntity)
    protected coordinationOfficeRepo: Repository<CoordinationOfficeEntity>,
    private userManagementService: CoordinationOfficeUserService
  ) {}

  async findAll(tenantId: string, filterParams: { enabled?: boolean } = {}) {
    return this.coordinationOfficeRepo.find({
      where: {
        tenantId,
        ...filterParams,
      },
      order: {
        pin: 'asc',
      },
    });
  }

  async findByPin(tenantId: string, pin: string) {
    return this.coordinationOfficeRepo.findOne({
      where: { tenantId, pin },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.coordinationOfficeRepo.findOne({
      where: { tenantId, id },
    });
  }

  async findByPins(tenantId: string, pins: string[]) {
    return this.coordinationOfficeRepo.find({
      where: pins.map(pin => ({ tenantId, pin })),
      order: {
        pin: 'asc',
      },
    });
  }

  async create(tenantId: string, createValues: Partial<CoordinationOfficeEntity>) {
    return this.coordinationOfficeRepo.create({ ...createValues, tenantId }).save();
  }

  async update(tenantId: string, id: string, updateValues: Partial<CoordinationOfficeEntity>) {
    return this.coordinationOfficeRepo.update({ tenantId, id }, updateValues).then((data) => ({
      ...data,
      id,
    }));
  }

  async delete(tenantId: string, id: string) {
    if (!id) throw new Error('ID required');
    return this.coordinationOfficeRepo.delete({ tenantId, id });
  }

  async pinExists(tenantId: string, pin: string, excludeId?: string) {
    const query = this.coordinationOfficeRepo.createQueryBuilder('co')
      .where('co.tenantId = :tenantId', { tenantId })
      .andWhere('co.pin = :pin', { pin });

    if (excludeId) {
      query.andWhere('co.id != :excludeId', { excludeId });
    }

    return query.getOne().then(result => !!result);
  }

  async toggleEnabled(tenantId: string, id: string) {
    const office = await this.coordinationOfficeRepo.findOne({
      where: { tenantId, id }
    });

    if (!office) {
      throw new Error('Coordination office not found');
    }

    office.enabled = !office.enabled;
    return office.save();
  }

  // User Management Methods - Delegated to UserManagementService

  async getAllUsers(tenantId: string): Promise<Partial<IAuthUser>[]> {
    return this.userManagementService.getAllUsers(tenantId);
  }

  async getUsersByPin(tenantId: string, pin: string): Promise<Partial<IAuthUser>[]> {
    return this.userManagementService.getUsersByPin(tenantId, pin);
  }

  async assignUser(tenantId: string, userId: string, coordinationOfficeId: string): Promise<boolean> {
    // Verify coordination office exists before delegating
    const office = await this.findById(tenantId, coordinationOfficeId);
    if (!office) {
      throw new NotFoundException('Coordination office not found');
    }

    return this.userManagementService.assignUser(tenantId, userId, coordinationOfficeId);
  }

  async unassignUser(tenantId: string, userId: string, coordinationOfficeId: string): Promise<boolean> {
    // Verify coordination office exists before delegating
    const office = await this.findById(tenantId, coordinationOfficeId);
    if (!office) {
      throw new NotFoundException('Coordination office not found');
    }

    return this.userManagementService.unassignUser(tenantId, userId, coordinationOfficeId);
  }
}
